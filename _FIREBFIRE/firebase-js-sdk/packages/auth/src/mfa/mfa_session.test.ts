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
import { MultiFactorSessionImpl, MultiFactorSessionType } from './mfa_session';

use(chaiAsPromised);

describe('core/mfa/mfa_session/MultiFactorSession', () => {
  describe('toJSON', () => {
    context('ENROLL', () => {
      it('should serialize correctly', () => {
        const mfaSession = MultiFactorSessionImpl._fromIdtoken('id-token');
        expect(mfaSession.toJSON()).to.eql({
          multiFactorSession: { idToken: 'id-token' }
        });
      });
    });

    context('SIGN_IN', () => {
      it('should serialize correctly', () => {
        const mfaSession = MultiFactorSessionImpl._fromMfaPendingCredential(
          'mfa-pending-credential'
        );
        expect(mfaSession.toJSON()).to.eql({
          multiFactorSession: { pendingCredential: 'mfa-pending-credential' }
        });
      });
    });
  });

  describe('.fromJSON', () => {
    context('ENROLL', () => {
      it('should deserialize correctly', () => {
        const mfaSession = MultiFactorSessionImpl.fromJSON({
          multiFactorSession: { idToken: 'id-token' }
        });
        expect(mfaSession).to.be.instanceOf(MultiFactorSessionImpl);
        expect(mfaSession!.type).to.eq(MultiFactorSessionType.ENROLL);
        expect(mfaSession!.credential).to.eq('id-token');
      });
    });

    context('SIGN_IN', () => {
      it('should deserialize correctly', () => {
        const mfaSession = MultiFactorSessionImpl.fromJSON({
          multiFactorSession: { pendingCredential: 'mfa-pending-credential' }
        });
        expect(mfaSession).to.be.instanceOf(MultiFactorSessionImpl);
        expect(mfaSession!.type).to.eq(MultiFactorSessionType.SIGN_IN);
        expect(mfaSession!.credential).to.eq('mfa-pending-credential');
      });
    });

    context('invalid', () => {
      it('should return null', () => {
        expect(MultiFactorSessionImpl.fromJSON({ multiFactorSession: {} })).to
          .be.null;
      });
    });
  });
});
