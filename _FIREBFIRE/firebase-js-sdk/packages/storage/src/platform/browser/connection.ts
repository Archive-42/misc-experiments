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

  Connection,
  ErrorCode
} from '../../implementation/connection';
import { internalError } from '../../implementation/error';

/**
 * Network layer for browsers. We use this instead of goog.net.XhrIo because
 * goog.net.XhrIo is hyuuuuge and doesn't work in React Native on Android.
 */
export class XhrConnection implements Connection {
  private xhr_: XMLHttpRequest;
  private errorCode_: ErrorCode;
  private sendPromise_: Promise<void>;
  private sent_: boolean = false;

  constructor() {
    this.xhr_ = new XMLHttpRequest();
    this.errorCode_ = ErrorCode.NO_ERROR;
    this.sendPromise_ = new Promise(resolve => {
      this.xhr_.addEventListener('abort', () => {
        this.errorCode_ = ErrorCode.ABORT;
        resolve();
      });
      this.xhr_.addEventListener('error', () => {
        this.errorCode_ = ErrorCode.NETWORK_ERROR;
        resolve();
      });
      this.xhr_.addEventListener('load', () => {
        resolve();
      });
    });
  }

  /**
   * @override
   */
  send(
    url: string,
    method: string,
    body?: ArrayBufferView | Blob | string,
    headers?: Headers
  ): Promise<void> {
    if (this.sent_) {
      throw internalError('cannot .send() more than once');
    }
    this.sent_ = true;
    this.xhr_.open(method, url, true);
    if (headers !== undefined) {
      for (const key in headers) {
        if (headers.hasOwnProperty(key)) {
          this.xhr_.setRequestHeader(key, headers[key].toString());
        }
      }
    }
    if (body !== undefined) {
      this.xhr_.send(body);
    } else {
      this.xhr_.send();
    }
    return this.sendPromise_;
  }

  /**
   * @override
   */
  getErrorCode(): ErrorCode {
    if (!this.sent_) {
      throw internalError('cannot .getErrorCode() before sending');
    }
    return this.errorCode_;
  }

  /**
   * @override
   */
  getStatus(): number {
    if (!this.sent_) {
      throw internalError('cannot .getStatus() before sending');
    }
    try {
      return this.xhr_.status;
    } catch (e) {
      return -1;
    }
  }

  /**
   * @override
   */
  getResponseText(): string {
    if (!this.sent_) {
      throw internalError('cannot .getResponseText() before sending');
    }
    return this.xhr_.responseText;
  }

  /**
   * Aborts the request.
   * @override
   */
  abort(): void {
    this.xhr_.abort();
  }

  /**
   * @override
   */
  getResponseHeader(header: string): string | null {
    return this.xhr_.getResponseHeader(header);
  }

  /**
   * @override
   */
  addUploadProgressListener(listener: (p1: ProgressEvent) => void): void {
    if (this.xhr_.upload != null) {
      this.xhr_.upload.addEventListener('progress', listener);
    }
  }

  /**
   * @override
   */
  removeUploadProgressListener(listener: (p1: ProgressEvent) => void): void {
    if (this.xhr_.upload != null) {
      this.xhr_.upload.removeEventListener('progress', listener);
    }
  }
}

export function newConnection(): Connection {
  return new XhrConnection();
}
