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

export function isJustDef<T>(p: T | null | undefined): p is T | null {
  return p !== void 0;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(p: unknown): p is Function {
  return typeof p === 'function';
}

export function isNonArrayObject(p: unknown): boolean {
  return typeof p === 'object' && !Array.isArray(p);
}

export function isString(p: unknown): p is string {
  return typeof p === 'string' || p instanceof String;
}

export function isNativeBlob(p: unknown): p is Blob {
  return isNativeBlobDefined() && p instanceof Blob;
}

export function isNativeBlobDefined(): boolean {
  return typeof Blob !== 'undefined';
}

export function validateNumber(
  argument: string,
  minValue: number,
  maxValue: number,
  value: number
): void {
  if (value < minValue) {
    throw invalidArgument(
      `Invalid value for '${argument}'. Expected ${minValue} or greater.`
    );
  }
  if (value > maxValue) {
    throw invalidArgument(
      `Invalid value for '${argument}'. Expected ${maxValue} or less.`
    );
  }
}
