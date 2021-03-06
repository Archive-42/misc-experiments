/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */

import { getModularInstance } from '@firebase/util';
import { expect } from 'chai';
import { getMessaging } from '@firebase/messaging';
import firebase from '@firebase/app-compat';
import '@firebase/messaging-compat';

import { TEST_PROJECT_CONFIG } from './util';

firebase.initializeApp(TEST_PROJECT_CONFIG);

const compatMessaging = firebase.messaging();
const modularMessaging = getMessaging();

describe('Messaging compat interop', () => {
  it('Messaging compat instance references modular Messaging instance', () => {
    expect(getModularInstance(compatMessaging)).to.equal(modularMessaging);
  });
});
