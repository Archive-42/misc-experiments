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

/**
 * Interface defining the set of actions that can be performed against the Firebase server
 * (basically corresponds to our wire protocol).
 *
 * @interface
 */
export abstract class ServerActions {
  abstract listen(
    query: QueryContext,
    currentHashFn: () => string,
    tag: number | null,
    onComplete: (a: string, b: unknown) => void
  ): void;

  /**
   * Remove a listen.
   */
  abstract unlisten(query: QueryContext, tag: number | null): void;

  /**
   * Get the server value satisfying this query.
   */
  abstract get(query: QueryContext): Promise<string>;

  put(
    pathString: string,
    data: unknown,
    onComplete?: (a: string, b: string) => void,
    hash?: string
  ) {}

  merge(
    pathString: string,
    data: unknown,
    onComplete: (a: string, b: string | null) => void,
    hash?: string
  ) {}

  /**
   * Refreshes the auth token for the current connection.
   * @param token - The authentication token
   */
  refreshAuthToken(token: string) {}

  /**
   * Refreshes the app check token for the current connection.
   * @param token The app check token
   */
  refreshAppCheckToken(token: string) {}

  onDisconnectPut(
    pathString: string,
    data: unknown,
    onComplete?: (a: string, b: string) => void
  ) {}

  onDisconnectMerge(
    pathString: string,
    data: unknown,
    onComplete?: (a: string, b: string) => void
  ) {}

  onDisconnectCancel(
    pathString: string,
    onComplete?: (a: string, b: string) => void
  ) {}

  reportStats(stats: { [k: string]: unknown }) {}
}
