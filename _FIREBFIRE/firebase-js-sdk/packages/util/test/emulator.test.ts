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
latorMockTokenOptions } from '../src/emulator';

// Firebase Auth tokens contain snake_case claims following the JWT standard / convention.
/* eslint-disable camelcase */

describe('createMockUserToken()', () => {
  it('creates a well-formed JWT', () => {
    const projectId = 'my-project';
    const options = { user_id: 'alice' };

    const token = createMockUserToken(options, projectId);
    const claims = JSON.parse(
      base64.decodeString(token.split('.')[1], /*webSafe=*/ true)
    );
    // We add an 'iat' field.
    expect(claims).to.deep.equal({
      iss: 'https://securetoken.google.com/' + projectId,
      aud: projectId,
      iat: 0,
      exp: 3600,
      auth_time: 0,
      sub: 'alice',
      user_id: 'alice',
      firebase: {
        sign_in_provider: 'custom',
        identities: {}
      }
    });
  });

  it('rejects "uid" field with error', () => {
    const options = { uid: 'alice' };

    expect(() =>
      createMockUserToken(options as unknown as EmulatorMockTokenOptions)
    ).to.throw(
      'The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.'
    );
  });
});
