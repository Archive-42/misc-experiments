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

import { spawn } from 'child-process-promise';
import * as yargs from 'yargs';

const argv = yargs.options({
  main: {
    type: 'string',
    demandOption: true
  },
  platform: {
    type: 'string',
    default: 'node'
  },
  emulator: {
    type: 'boolean'
  },
  persistence: {
    type: 'boolean'
  }
}).parseSync();

const nyc = resolve(__dirname, '../../../node_modules/.bin/nyc');
const mocha = resolve(__dirname, '../../../node_modules/.bin/mocha');

process.env.TS_NODE_CACHE = 'NO';
process.env.TS_NODE_COMPILER_OPTIONS = '{"module":"commonjs"}';
process.env.TEST_PLATFORM = argv.platform;

let args = [
  '--reporter',
  'lcovonly',
  mocha,
  '--require',
  'ts-node/register',
  '--require',
  argv.main,
  '--config',
  '../../config/mocharc.node.js'
];

if (argv.emulator) {
  process.env.FIRESTORE_EMULATOR_PORT = '8080';
  process.env.FIRESTORE_EMULATOR_PROJECT_ID = 'test-emulator';
}

if (argv.persistence) {
  process.env.USE_MOCK_PERSISTENCE = 'YES';
  args.push('--require', 'test/util/node_persistence.ts');
}

args = args.concat(argv._ as string[]);

const childProcess = spawn(nyc, args, {
  stdio: 'inherit',
  cwd: process.cwd()
}).childProcess;

process.once('exit', () => childProcess.kill());
process.once('SIGINT', () => childProcess.kill('SIGINT'));
process.once('SIGTERM', () => childProcess.kill('SIGTERM'));
