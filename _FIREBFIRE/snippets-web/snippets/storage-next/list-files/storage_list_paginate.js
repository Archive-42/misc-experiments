// This snippet file was generated by processing the source file:
// ./storage-next/list-files.js
//
// To update the snippets in this file, edit the source and then run
// 'npm run snippets'.

// [START storage_list_paginate_modular]
import { getStorage, ref, list } from "firebase/storage";

async function pageTokenExample(){
  // Create a reference under which you want to list
  const storage = getStorage();
  const listRef = ref(storage, 'files/uid');

  // Fetch the first page of 100.
  const firstPage = await list(listRef, { maxResults: 100 });

  // Use the result.
  // processItems(firstPage.items)
  // processPrefixes(firstPage.prefixes)

  // Fetch the second page if there are more elements.
  if (firstPage.nextPageToken) {
    const secondPage = await list(listRef, {
      maxResults: 100,
      pageToken: firstPage.nextPageToken,
    });
    // processItems(secondPage.items)
    // processPrefixes(secondPage.prefixes)
  }
}
// [END storage_list_paginate_modular]