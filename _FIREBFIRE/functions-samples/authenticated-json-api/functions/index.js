

'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Follow instructions to set up admin credentials:
// https://firebase.google.com/docs/functions/local-emulator#set_up_admin_credentials_optional
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  // TODO: ADD YOUR DATABASE URL
  databaseURL: undefined
});

const language = require('@google-cloud/language');
const client = new language.LanguageServiceClient();
const express = require('express');
const app = express();


// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const authenticate = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send('Unauthorized');
    return;
  }
  const idToken = req.headers.authorization.split('Bearer ')[1];
  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch(e) {
    res.status(403).send('Unauthorized');
    return;
  }
};

app.use(authenticate);

// POST /api/messages
// Create a new message, get its sentiment using Google Cloud NLP,
// and categorize the sentiment before saving.
app.post('/api/messages', async (req, res) => {
  const message = req.body.message;

  functions.logger.log(`ANALYZING MESSAGE: "${message}"`);

  try {
    const results = await client.analyzeSentiment({
      document: { content: message, type: 'PLAIN_TEXT' }
    });

    const category = categorizeScore(results[0].documentSentiment.score);
    const data = {message: message, sentiment: results[0], category: category};

    // @ts-ignore
    const uid = req.user.uid;
    await admin.database().ref(`/users/${uid}/messages`).push(data);

    res.status(201).json({message, category});
  } catch(error) {
    functions.logger.log(
      'Error detecting sentiment or saving message',
      error.message
    );
    res.sendStatus(500);
  }
});

// GET /api/messages?category={category}
// Get all messages, optionally specifying a category to filter on
app.get('/api/messages', async (req, res) => {
  // @ts-ignore
  const uid = req.user.uid;
  const category = `${req.query.category}`;

  /** @type admin.database.Query */
  let query = admin.database().ref(`/users/${uid}/messages`);

  if (category && ['positive', 'negative', 'neutral'].indexOf(category) > -1) {
    // Update the query with the valid category
    query = query.orderByChild('category').equalTo(category);
  } else if (category) {
    res.status(404).json({errorCode: 404, errorMessage: `category '${category}' not found`});
    return;
  }
  try {
    const snapshot = await query.once('value');
    let messages = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({key: childSnapshot.key, message: childSnapshot.val().message});
    });

    res.status(200).json(messages);
  } catch(error) {
    functions.logger.log('Error getting messages', error.message);
    res.sendStatus(500);
  }
});

// GET /api/message/{messageId}
// Get details about a message
app.get('/api/message/:messageId', async (req, res) => {
  const messageId = req.params.messageId;

  functions.logger.log(`LOOKING UP MESSAGE "${messageId}"`);

  try {
    // @ts-ignore
    const uid = req.user.uid;
    const snapshot = await admin.database().ref(`/users/${uid}/messages/${messageId}`).once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({errorCode: 404, errorMessage: `message '${messageId}' not found`});
    }
    res.set('Cache-Control', 'private, max-age=300');
    return res.status(200).json(snapshot.val());
  } catch(error) {
    functions.logger.log(
      'Error getting message details',
      messageId,
      error.message
    );
    return res.sendStatus(500);
  }
});

// Expose the API as a function
exports.api = functions.https.onRequest(app);

// Helper function to categorize a sentiment score as positive, negative, or neutral
const categorizeScore = (score) => {
  if (score > 0.25) {
    return 'positive';
  } else if (score < -0.25) {
    return 'negative';
  }
  return 'neutral';
};
