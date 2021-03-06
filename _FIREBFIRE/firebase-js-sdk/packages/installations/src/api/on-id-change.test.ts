/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

import '../testing/setup';
import { onIdChange } from './on-id-change';
import * as FidChangedModule from '../helpers/fid-changed';
import { getFakeInstallations } from '../testing/fake-generators';
import { FirebaseInstallationsImpl } from '../interfaces/installation-impl';

describe('onIdChange', () => {
  let installations: FirebaseInstallationsImpl;

  beforeEach(() => {
    installations = getFakeInstallations();
    stub(FidChangedModule);
  });

  it('calls addCallback with the given callback and app key when called', () => {
    const callback = stub();
    onIdChange(installations, callback);
    expect(FidChangedModule.addCallback).to.have.been.calledOnceWith(
      installations.appConfig,
      callback
    );
  });

  it('calls removeCallback with the given callback and app key when unsubscribe is called', () => {
    const callback = stub();
    const unsubscribe = onIdChange(installations, callback);
    unsubscribe();
    expect(FidChangedModule.removeCallback).to.have.been.calledOnceWith(
      installations.appConfig,
      callback
    );
  });
});
