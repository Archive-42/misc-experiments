// This snippet file was generated by processing the source file:
// ./functions-next/callable.js
//
// To update the snippets in this file, edit the source and then run
// 'npm run snippets'.

// [START fb_functions_initialize_modular]
import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";

initializeApp({
  // Your Firebase Web SDK configuration
  // [START_EXCLUDE]
  projectId: "<PROJECT_ID>",
  apiKey: "<API_KEY>",
  // [END_EXCLUDE]
});

const functions = getFunctions();
// [END fb_functions_initialize_modular]