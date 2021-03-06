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
 '../services/perf_logger';
import { PerformanceController } from '../controllers/perf';

// The order of values of this enum should not be changed.
export const enum HttpMethod {
  HTTP_METHOD_UNKNOWN = 0,
  GET = 1,
  PUT = 2,
  POST = 3,
  DELETE = 4,
  HEAD = 5,
  PATCH = 6,
  OPTIONS = 7,
  TRACE = 8,
  CONNECT = 9
}

// Durations are in microseconds.
export interface NetworkRequest {
  performanceController: PerformanceController;
  url: string;
  httpMethod?: HttpMethod;
  requestPayloadBytes?: number;
  responsePayloadBytes?: number;
  httpResponseCode?: number;
  responseContentType?: string;
  startTimeUs?: number;
  timeToRequestCompletedUs?: number;
  timeToResponseInitiatedUs?: number;
  timeToResponseCompletedUs?: number;
}

export function createNetworkRequestEntry(
  performanceController: PerformanceController,
  entry: PerformanceEntry
): void {
  const performanceEntry = entry as PerformanceResourceTiming;
  if (!performanceEntry || performanceEntry.responseStart === undefined) {
    return;
  }
  const timeOrigin = Api.getInstance().getTimeOrigin();
  const startTimeUs = Math.floor(
    (performanceEntry.startTime + timeOrigin) * 1000
  );
  const timeToResponseInitiatedUs = performanceEntry.responseStart
    ? Math.floor(
        (performanceEntry.responseStart - performanceEntry.startTime) * 1000
      )
    : undefined;
  const timeToResponseCompletedUs = Math.floor(
    (performanceEntry.responseEnd - performanceEntry.startTime) * 1000
  );
  // Remove the query params from logged network request url.
  const url = performanceEntry.name && performanceEntry.name.split('?')[0];
  const networkRequest: NetworkRequest = {
    performanceController,
    url,
    responsePayloadBytes: performanceEntry.transferSize,
    startTimeUs,
    timeToResponseInitiatedUs,
    timeToResponseCompletedUs
  };

  logNetworkRequest(networkRequest);
}
