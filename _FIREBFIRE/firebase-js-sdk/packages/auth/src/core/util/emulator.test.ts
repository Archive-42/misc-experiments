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

import { ConfigInternal } from '../../model/auth';
import { _emulatorUrl } from './emulator';

describe('core/util/emulator', () => {
  const config: ConfigInternal = {
    emulator: {
      url: 'http://localhost:4000/'
    }
  } as ConfigInternal;

  it('builds the proper URL with no path', () => {
    expect(_emulatorUrl(config)).to.eq('http://localhost:4000/');
  });

  it('builds the proper URL with a path', () => {
    expect(_emulatorUrl(config, '/test/path')).to.eq(
      'http://localhost:4000/test/path'
    );
  });

  it('builds the proper URL with a path missing separator', () => {
    expect(_emulatorUrl(config, 'test/path')).to.eq(
      'http://localhost:4000/test/path'
    );
  });
});
