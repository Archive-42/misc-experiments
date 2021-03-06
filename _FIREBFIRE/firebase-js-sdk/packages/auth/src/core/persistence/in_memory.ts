/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

import {
  PersistenceInternal,
  PersistenceType,
  PersistenceValue,
  StorageEventListener
} from '../persistence';

export class InMemoryPersistence implements PersistenceInternal {
  static type: 'NONE' = 'NONE';
  readonly type = PersistenceType.NONE;
  storage: Record<string, PersistenceValue> = {};

  async _isAvailable(): Promise<boolean> {
    return true;
  }

  async _set(key: string, value: PersistenceValue): Promise<void> {
    this.storage[key] = value;
  }

  async _get<T extends PersistenceValue>(key: string): Promise<T | null> {
    const value = this.storage[key];
    return value === undefined ? null : (value as T);
  }

  async _remove(key: string): Promise<void> {
    delete this.storage[key];
  }

  _addListener(_key: string, _listener: StorageEventListener): void {
    // Listeners are not supported for in-memory storage since it cannot be shared across windows/workers
    return;
  }

  _removeListener(_key: string, _listener: StorageEventListener): void {
    // Listeners are not supported for in-memory storage since it cannot be shared across windows/workers
    return;
  }
}

/**
 * An implementation of {@link Persistence} of type 'NONE'.
 *
 * @public
 */
export const inMemoryPersistence: Persistence = InMemoryPersistence;
