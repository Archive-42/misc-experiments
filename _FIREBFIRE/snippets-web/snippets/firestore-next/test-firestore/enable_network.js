// This snippet file was generated by processing the source file:
// ./firestore-next/test.firestore.js
//
// To update the snippets in this file, edit the source and then run
// 'npm run snippets'.

// [START enable_network_modular]
import { enableNetwork } from "firebase/firestore"; 

await enableNetwork(db);
// Do online actions
// [START_EXCLUDE]
console.log("Network enabled!");
// [END_EXCLUDE]
// [END enable_network_modular]