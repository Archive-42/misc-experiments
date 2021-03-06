/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

import { PhoneOrOauthTokenResponse } from '../../src/api/authentication/mfa';
import { AuthCredential } from '../../src/core/credentials';
import { AuthInternal } from '../../src/model/auth';
import { IdTokenResponse } from '../../src/model/id_token';

export class MockAuthCredential implements AuthCredential {
  constructor(
    readonly providerId: ProviderId,
    readonly signInMethod: SignInMethod
  ) {}

  toJSON(): object {
    throw new Error('Method not implemented.');
  }

  fromJSON(_json: string | object): AuthCredential | null {
    throw new Error('Method not implemented.');
  }

  async _getIdTokenResponse(
    _auth: AuthInternal
  ): Promise<PhoneOrOauthTokenResponse> {
    throw new Error('Method not implemented.');
  }

  async _linkToIdToken(
    _auth: AuthInternal,
    _idToken: string
  ): Promise<IdTokenResponse> {
    throw new Error('Method not implemented.');
  }

  async _getReauthenticationResolver(
    _auth: AuthInternal
  ): Promise<IdTokenResponse> {
    throw new Error('Method not implemented.');
  }
}
