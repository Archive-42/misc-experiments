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
 * SortedSet is an immutable (copy-on-write) collection that holds elements
 * in order specified by the provided comparator.
 *
 * NOTE: if provided comparator returns 0 for two elements, we consider them to
 * be equal!
 */
export class SortedSet<T> {
  private data: SortedMap<T, boolean>;

  constructor(private comparator: (left: T, right: T) => number) {
    this.data = new SortedMap<T, boolean>(this.comparator);
  }

  has(elem: T): boolean {
    return this.data.get(elem) !== null;
  }

  first(): T | null {
    return this.data.minKey();
  }

  last(): T | null {
    return this.data.maxKey();
  }

  get size(): number {
    return this.data.size;
  }

  indexOf(elem: T): number {
    return this.data.indexOf(elem);
  }

  /** Iterates elements in order defined by "comparator" */
  forEach(cb: (elem: T) => void): void {
    this.data.inorderTraversal((k: T, v: boolean) => {
      cb(k);
      return false;
    });
  }

  /** Iterates over `elem`s such that: range[0] &lt;= elem &lt; range[1]. */
  forEachInRange(range: [T, T], cb: (elem: T) => void): void {
    const iter = this.data.getIteratorFrom(range[0]);
    while (iter.hasNext()) {
      const elem = iter.getNext();
      if (this.comparator(elem.key, range[1]) >= 0) {
        return;
      }
      cb(elem.key);
    }
  }

  /**
   * Iterates over `elem`s such that: start &lt;= elem until false is returned.
   */
  forEachWhile(cb: (elem: T) => boolean, start?: T): void {
    let iter: SortedMapIterator<T, boolean>;
    if (start !== undefined) {
      iter = this.data.getIteratorFrom(start);
    } else {
      iter = this.data.getIterator();
    }
    while (iter.hasNext()) {
      const elem = iter.getNext();
      const result = cb(elem.key);
      if (!result) {
        return;
      }
    }
  }

  /** Finds the least element greater than or equal to `elem`. */
  firstAfterOrEqual(elem: T): T | null {
    const iter = this.data.getIteratorFrom(elem);
    return iter.hasNext() ? iter.getNext().key : null;
  }

  getIterator(): SortedSetIterator<T> {
    return new SortedSetIterator<T>(this.data.getIterator());
  }

  getIteratorFrom(key: T): SortedSetIterator<T> {
    return new SortedSetIterator<T>(this.data.getIteratorFrom(key));
  }

  /** Inserts or updates an element */
  add(elem: T): SortedSet<T> {
    return this.copy(this.data.remove(elem).insert(elem, true));
  }

  /** Deletes an element */
  delete(elem: T): SortedSet<T> {
    if (!this.has(elem)) {
      return this;
    }
    return this.copy(this.data.remove(elem));
  }

  isEmpty(): boolean {
    return this.data.isEmpty();
  }

  unionWith(other: SortedSet<T>): SortedSet<T> {
    let result: SortedSet<T> = this;

    // Make sure `result` always refers to the larger one of the two sets.
    if (result.size < other.size) {
      result = other;
      other = this;
    }

    other.forEach(elem => {
      result = result.add(elem);
    });
    return result;
  }

  isEqual(other: SortedSet<T>): boolean {
    if (!(other instanceof SortedSet)) {
      return false;
    }
    if (this.size !== other.size) {
      return false;
    }

    const thisIt = this.data.getIterator();
    const otherIt = other.data.getIterator();
    while (thisIt.hasNext()) {
      const thisElem = thisIt.getNext().key;
      const otherElem = otherIt.getNext().key;
      if (this.comparator(thisElem, otherElem) !== 0) {
        return false;
      }
    }
    return true;
  }

  toArray(): T[] {
    const res: T[] = [];
    this.forEach(targetId => {
      res.push(targetId);
    });
    return res;
  }

  toString(): string {
    const result: T[] = [];
    this.forEach(elem => result.push(elem));
    return 'SortedSet(' + result.toString() + ')';
  }

  private copy(data: SortedMap<T, boolean>): SortedSet<T> {
    const result = new SortedSet(this.comparator);
    result.data = data;
    return result;
  }
}

export class SortedSetIterator<T> {
  constructor(private iter: SortedMapIterator<T, boolean>) {}

  getNext(): T {
    return this.iter.getNext().key;
  }

  hasNext(): boolean {
    return this.iter.hasNext();
  }
}
