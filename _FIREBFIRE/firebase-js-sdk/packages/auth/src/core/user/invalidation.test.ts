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
chai-as-promised';

import { FirebaseError } from '@firebase/util';

import { testAuth, testUser } from '../../../test/helpers/mock_auth';
import { AuthInternal } from '../../model/auth';
import { UserInternal } from '../../model/user';
import { AuthErrorCode } from '../errors';
import { _logoutIfInvalidated } from './invalidation';
import { _createError } from '../util/assert';

use(chaiAsPromised);

describe('core/user/invalidation', () => {
  let user: UserInternal;
  let auth: AuthInternal;

  beforeEach(async () => {
    auth = await testAuth();
    user = testUser(auth, 'uid');
    await auth._updateCurrentUser(user);
  });

  function makeError(code: AuthErrorCode): FirebaseError {
    return _createError(auth, code);
  }

  it('leaves non-invalidation errors alone', async () => {
    const error = makeError(AuthErrorCode.TOO_MANY_ATTEMPTS_TRY_LATER);
    await expect(
      _logoutIfInvalidated(user, Promise.reject(error))
    ).to.be.rejectedWith(error);
    expect(auth.currentUser).to.eq(user);
  });

  it('does nothing if the promise resolves', async () => {
    await _logoutIfInvalidated(user, Promise.resolve({}));
    expect(auth.currentUser).to.eq(user);
  });

  it('logs out the user if the error is user_disabled', async () => {
    const error = makeError(AuthErrorCode.USER_DISABLED);
    await expect(
      _logoutIfInvalidated(user, Promise.reject(error))
    ).to.be.rejectedWith(error);
    expect(auth.currentUser).to.be.null;
  });

  it('does not log out if bypass auth state is true', async () => {
    const error = makeError(AuthErrorCode.USER_DISABLED);
    try {
      await _logoutIfInvalidated(user, Promise.reject(error), true);
    } catch {}
    expect(auth.currentUser).to.eq(user);
  });

  it('logs out the user if the error is token_expired', async () => {
    const error = makeError(AuthErrorCode.TOKEN_EXPIRED);
    await expect(
      _logoutIfInvalidated(user, Promise.reject(error))
    ).to.be.rejectedWith(error);
    expect(auth.currentUser).to.be.null;
  });

  context('with another logged in user', () => {
    let user2: UserInternal;

    beforeEach(async () => {
      user2 = testUser(auth, 'uid2');
      await auth._updateCurrentUser(user2);
    });

    it('does not log out user2 if the error is user_disabled', async () => {
      const error = makeError(AuthErrorCode.USER_DISABLED);
      await expect(
        _logoutIfInvalidated(user, Promise.reject(error))
      ).to.be.rejectedWith(error);
      expect(auth.currentUser).to.eq(user2);
    });
  });
});
