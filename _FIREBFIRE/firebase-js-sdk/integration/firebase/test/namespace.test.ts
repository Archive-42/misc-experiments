/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */

import firebase from 'firebase/compat';
import * as namespaceDefinition from './namespaceDefinition.json';
import validateNamespace from './validator';

firebase.initializeApp({
  apiKey: 'test-api-key',
  authDomain: 'test-project-name.firebaseapp.com',
  databaseURL: 'https://test-project-name.firebaseio.com',
  projectId: 'test-project-name',
  storageBucket: 'test-project-name.appspot.com',
  messagingSenderId: '012345678910',
  appId: 'myAppId'
});

describe('Firebase Namespace Validation', function () {
  validateNamespace(namespaceDefinition, firebase);
});
