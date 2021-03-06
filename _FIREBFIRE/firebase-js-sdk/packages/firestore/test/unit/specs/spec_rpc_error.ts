/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
c/util/error';

/**
 * An error encountered making RPCs.
 */
export class RpcError extends Error {
  code: number;

  constructor(code: Code | number, message: string) {
    super(message);

    if (typeof code === 'number') {
      this.code = code;
    } else {
      this.code = mapRpcCodeFromCode(code);
    }

    // TODO(mikelehen): Error is a function not a class in ES5 so extending it
    // doesn't really work without hackery.  Just manually set .message for now.
    this.message = message;
  }
}
