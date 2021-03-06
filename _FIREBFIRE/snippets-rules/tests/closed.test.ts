/*
 * Copyright 2020 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *

import * as firebase from '@firebase/rules-unit-testing';

import { readRulesFile, getAuthedDb } from './util';

describe('[Closed Rules]', () => {
  before(async () => {
    await firebase.loadFirestoreRules({
      projectId: 'closed-rules',
      rules: readRulesFile('../rules/closed.rules')
    });
  });

  it('should deny a read any any path to closed rules', async () => {
    const db = getAuthedDb('closed-rules', undefined);

    await firebase.assertFails(
      db
        .collection('any')
        .doc('doc')
        .get()
    );
  });
});
