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
import * as sinon from 'sinon';

import { FirebaseError } from '@firebase/util';

import { mockEndpoint } from '../../../test/helpers/api/helper';
import { testAuth } from '../../../test/helpers/mock_auth';
import * as fetch from '../../../test/helpers/mock_fetch';
import { Endpoint } from '../../api';
import { AuthInternal } from '../../model/auth';
import * as location from './location';
import { _validateOrigin } from './validate_origin';

use(chaiAsPromised);

describe('core/util/validate_origin', () => {
  let auth: AuthInternal;
  let authorizedDomains: string[];
  let currentUrl: string;
  beforeEach(async () => {
    authorizedDomains = [];
    currentUrl = '';

    auth = await testAuth();
    fetch.setUp();
    mockEndpoint(Endpoint.GET_PROJECT_CONFIG, {
      get authorizedDomains(): string[] {
        return authorizedDomains;
      }
    });

    sinon.stub(location, '_getCurrentUrl').callsFake(() => currentUrl);
  });

  afterEach(() => {
    fetch.tearDown();
    sinon.restore();
  });

  it('smoke test', async () => {
    currentUrl = 'https://google.com';
    authorizedDomains = ['google.com'];
    await expect(_validateOrigin(auth)).to.be.fulfilled;
  });

  it('failure smoke test', async () => {
    currentUrl = 'https://google.com';
    authorizedDomains = ['youtube.com'];
    await expect(_validateOrigin(auth)).to.be.rejectedWith(
      FirebaseError,
      'auth/unauthorized-domain'
    );
  });

  it('works when one domain matches', async () => {
    currentUrl = 'https://google.com';
    authorizedDomains = ['youtube.com', 'google.com'];
    await expect(_validateOrigin(auth)).to.be.fulfilled;
  });

  it('fails when all domains fail', async () => {
    currentUrl = 'https://google.com';
    authorizedDomains = ['youtube.com', 'firebase.com'];
    await expect(_validateOrigin(auth)).to.be.rejectedWith(
      FirebaseError,
      'auth/unauthorized-domain'
    );
  });

  it('works for chrome extensions', async () => {
    currentUrl = 'chrome-extension://somereallylongcomplexstring';
    authorizedDomains = [
      'google.com',
      'chrome-extension://somereallylongcomplexstring'
    ];
    await expect(_validateOrigin(auth)).to.be.fulfilled;
  });

  it('fails for wrong chrome extensions', async () => {
    currentUrl = 'chrome-extension://somereallylongcomplexstring';
    authorizedDomains = [
      'google.com',
      'chrome-extension://someOTHERreallylongcomplexstring'
    ];
    await expect(_validateOrigin(auth)).to.be.rejectedWith(
      FirebaseError,
      'auth/unauthorized-domain'
    );
  });

  it('works for subdomains', async () => {
    currentUrl = 'http://firebase.google.com';
    authorizedDomains = ['google.com'];
    await expect(_validateOrigin(auth)).to.be.fulfilled;
  });

  it('works for deeply-linked pages', async () => {
    currentUrl = 'http://firebase.google.com/a/b/c/d/e/f/g.html';
    authorizedDomains = ['google.com'];
    await expect(_validateOrigin(auth)).to.be.fulfilled;
  });

  it('works with IP addresses', async () => {
    currentUrl = 'http://192.168.0.1/a/b/c';
    authorizedDomains = ['192.168.0.1'];
    await expect(_validateOrigin(auth)).to.be.fulfilled;
  });

  it('fails with different IP addresses', async () => {
    currentUrl = 'http://192.168.0.100/a/b/c';
    authorizedDomains = ['192.168.0.1'];
    await expect(_validateOrigin(auth)).to.be.rejectedWith(
      FirebaseError,
      'auth/unauthorized-domain'
    );
  });
});
