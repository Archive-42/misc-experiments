// This snippet file was generated by processing the source file:
// ./appcheck-next/index.js
//
// To update the snippets in this file, edit the source and then run
// 'npm run snippets'.

// [START appcheck_nonfirebase_modular]
import { initializeAppCheck, getToken } from 'firebase/app-check';

const appCheck = initializeAppCheck(
    app,
    { provider: provider } // ReCaptchaV3Provider or CustomProvider
);

const callApiWithAppCheckExample = async () => {
  let appCheckTokenResponse;
  try {
      appCheckTokenResponse = await getToken(appCheck, /* forceRefresh= */ false);
  } catch (err) {
      // Handle any errors if the token was not retrieved.
      return;
  }

  // Include the App Check token with requests to your server.
  const apiResponse = await fetch('https://yourbackend.example.com/yourApiEndpoint', {
      headers: {
          'X-Firebase-AppCheck': appCheckTokenResponse.token,
      }
  });

  // Handle response from your backend.
};
// [END appcheck_nonfirebase_modular]