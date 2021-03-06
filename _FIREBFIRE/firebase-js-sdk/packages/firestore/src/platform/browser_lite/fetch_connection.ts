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
../core/database_info';
import { Stream } from '../../remote/connection';
import { RestConnection } from '../../remote/rest_connection';
import { mapCodeFromHttpStatus } from '../../remote/rpc_error';
import { FirestoreError } from '../../util/error';
import { StringMap } from '../../util/types';

/**
 * A Rest-based connection that relies on the native HTTP stack
 * (e.g. `fetch` or a polyfill).
 */
export class FetchConnection extends RestConnection {
  /**
   * @param databaseInfo - The connection info.
   * @param fetchImpl - `fetch` or a Polyfill that implements the fetch API.
   */
  constructor(
    databaseInfo: DatabaseInfo,
    private readonly fetchImpl: typeof fetch
  ) {
    super(databaseInfo);
  }

  openStream<Req, Resp>(
    rpcName: string,
    token: Token | null
  ): Stream<Req, Resp> {
    throw new Error('Not supported by FetchConnection');
  }

  protected async performRPCRequest<Req, Resp>(
    rpcName: string,
    url: string,
    headers: StringMap,
    body: Req
  ): Promise<Resp> {
    const requestJson = JSON.stringify(body);
    let response: Response;

    try {
      response = await this.fetchImpl(url, {
        method: 'POST',
        headers,
        body: requestJson
      });
    } catch (err) {
      throw new FirestoreError(
        mapCodeFromHttpStatus(err.status),
        'Request failed with error: ' + err.statusText
      );
    }

    if (!response.ok) {
      throw new FirestoreError(
        mapCodeFromHttpStatus(response.status),
        'Request failed with error: ' + response.statusText
      );
    }

    return response.json();
  }
}
