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

export const enum ChangeType {
  /** Event type for a child added */
  CHILD_ADDED = 'child_added',
  /** Event type for a child removed */
  CHILD_REMOVED = 'child_removed',
  /** Event type for a child changed */
  CHILD_CHANGED = 'child_changed',
  /** Event type for a child moved */
  CHILD_MOVED = 'child_moved',
  /** Event type for a value change */
  VALUE = 'value'
}

export interface Change {
  /** @param type - The event type */
  type: ChangeType;
  /** @param snapshotNode - The data */
  snapshotNode: Node;
  /** @param childName - The name for this child, if it's a child even */
  childName?: string;
  /** @param oldSnap - Used for intermediate processing of child changed events */
  oldSnap?: Node;
  /**  * @param prevName - The name for the previous child, if applicable */
  prevName?: string | null;
}

export function changeValue(snapshotNode: Node): Change {
  return { type: ChangeType.VALUE, snapshotNode };
}

export function changeChildAdded(
  childName: string,
  snapshotNode: Node
): Change {
  return { type: ChangeType.CHILD_ADDED, snapshotNode, childName };
}

export function changeChildRemoved(
  childName: string,
  snapshotNode: Node
): Change {
  return { type: ChangeType.CHILD_REMOVED, snapshotNode, childName };
}

export function changeChildChanged(
  childName: string,
  snapshotNode: Node,
  oldSnap: Node
): Change {
  return {
    type: ChangeType.CHILD_CHANGED,
    snapshotNode,
    childName,
    oldSnap
  };
}

export function changeChildMoved(
  childName: string,
  snapshotNode: Node
): Change {
  return { type: ChangeType.CHILD_MOVED, snapshotNode, childName };
}
