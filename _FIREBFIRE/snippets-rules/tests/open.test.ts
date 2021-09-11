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

describe('[Open Rules]', () => {
  before(async () => {
    await firebase.loadFirestoreRules({
      projectId: 'open-rules',
      rules: readRulesFile('../rules/open.rules')
    });
  });

  it('should allow a read at any path to open rules', async () => {
    const db = getAuthedDb('open-rules', undefined);

    await firebase.assertSucceeds(
      db
        .collection('any')
        .doc('doc')
        .get()
    );
  });
});
