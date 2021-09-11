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

import { DatabaseInfo } from '../../core/database_info';
import { Connection } from '../../remote/connection';
import { FetchConnection } from '../browser_lite/fetch_connection';

export { newConnectivityMonitor } from '../browser/connection';

/** Initializes the HTTP connection for the REST API. */
export function newConnection(databaseInfo: DatabaseInfo): Connection {
  // node-fetch is meant to be API compatible with `fetch`, but its type doesn't
  // match 100%.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new FetchConnection(databaseInfo, nodeFetch as any);
}
