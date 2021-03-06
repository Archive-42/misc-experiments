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
iate number of arguments are provided for a public function.
 * Throws an error if it fails.
 *
 * @param fnName The function name
 * @param minCount The minimum number of arguments to allow for the function call
 * @param maxCount The maximum number of argument to allow for the function call
 * @param argCount The actual number of arguments provided.
 */
export const validateArgCount = function (
  fnName: string,
  minCount: number,
  maxCount: number,
  argCount: number
): void {
  let argError;
  if (argCount < minCount) {
    argError = 'at least ' + minCount;
  } else if (argCount > maxCount) {
    argError = maxCount === 0 ? 'none' : 'no more than ' + maxCount;
  }
  if (argError) {
    const error =
      fnName +
      ' failed: Was called with ' +
      argCount +
      (argCount === 1 ? ' argument.' : ' arguments.') +
      ' Expects ' +
      argError +
      '.';
    throw new Error(error);
  }
};

/**
 * Generates a string to prefix an error message about failed argument validation
 *
 * @param fnName The function name
 * @param argName The name of the argument
 * @return The prefix to add to the error thrown for validation.
 */
export function errorPrefix(fnName: string, argName: string): string {
  return `${fnName} failed: ${argName} argument `;
}

/**
 * @param fnName
 * @param argumentNumber
 * @param namespace
 * @param optional
 */
export function validateNamespace(
  fnName: string,
  namespace: string,
  optional: boolean
): void {
  if (optional && !namespace) {
    return;
  }
  if (typeof namespace !== 'string') {
    //TODO: I should do more validation here. We only allow certain chars in namespaces.
    throw new Error(
      errorPrefix(fnName, 'namespace') + 'must be a valid firebase namespace.'
    );
  }
}

export function validateCallback(
  fnName: string,
  argumentName: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback: Function,
  optional: boolean
): void {
  if (optional && !callback) {
    return;
  }
  if (typeof callback !== 'function') {
    throw new Error(
      errorPrefix(fnName, argumentName) + 'must be a valid function.'
    );
  }
}

export function validateContextObject(
  fnName: string,
  argumentName: string,
  context: unknown,
  optional: boolean
): void {
  if (optional && !context) {
    return;
  }
  if (typeof context !== 'object' || context === null) {
    throw new Error(
      errorPrefix(fnName, argumentName) + 'must be a valid context object.'
    );
  }
}
