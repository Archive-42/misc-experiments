// This snippet file was generated by processing the source file:
// ./auth-next/index.js
//
// To update the snippets in this file, edit the source and then run
// 'npm run snippets'.

// [START auth_make_facebook_credential_modular]
import { FacebookAuthProvider } from "firebase/auth";

const credential = FacebookAuthProvider.credential(
  response.authResponse.accessToken);
// [END auth_make_facebook_credential_modular]