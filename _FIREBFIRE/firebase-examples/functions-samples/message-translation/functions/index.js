/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *

 */
'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const { TranslationServiceClient } = require('@google-cloud/translate');

const translate = new TranslationServiceClient();

// List of output languages.
const LANGUAGES = ['en', 'es', 'de', 'fr', 'sv', 'ga', 'it', 'jp'];

// Translate an incoming message.
exports.translate = functions.database.ref('/messages/{languageID}/{messageID}').onWrite(
    (change, context) => {
      const snapshot = change.after;
      if (snapshot.val().translated) {
        return null;
      }
      const promises = [];
      for (let i = 0; i < LANGUAGES.length; i++) {
        const language = LANGUAGES[i];
        if (language !== context.params.languageID) {
          promises.push(async () => {
            const results = await translate.translateText({ 
              contents: [snapshot.val().message], 
              sourceLanguageCode: context.params.languageID, 
              targetLanguageCode: language 
            });
            return admin.database().ref(`/messages/${language}/${snapshot.key}`).set({
              message: results[0],
              translated: true,
            });
          });
        }
      }
      return Promise.all(promises);
    });
