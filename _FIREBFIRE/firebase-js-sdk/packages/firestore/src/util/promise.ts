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

}

export interface Rejecter {
  (reason?: Error): void;
}

export class Deferred<R = void> {
  promise: Promise<R>;
  // Assigned synchronously in constructor by Promise constructor callback.
  resolve!: Resolver<R>;
  reject!: Rejecter;

  constructor() {
    this.promise = new Promise((resolve: Resolver<R>, reject: Rejecter) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

/**
 * Takes an array of values and a function from a value to a Promise. The function is run on each
 * value sequentially, waiting for the previous promise to resolve before starting the next one.
 * The returned promise resolves once the function has been run on all values.
 */
export function sequence<T>(
  values: T[],
  fn: (value: T) => Promise<void>
): Promise<void> {
  let p = Promise.resolve();
  for (const value of values) {
    p = p.then(() => fn(value));
  }
  return p;
}
