/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
MMON_UTIL_H_

#include <string>

namespace firebase {
namespace firestore {

// Returns a reference to an empty string. This is useful for functions that may
// need to return the reference while being in a state where they don't have
// a string to refer to.
const std::string& EmptyString();

// Returns true if the two given pointers are equal or the underlying objects
// that they point to are equal. Returns false otherwise.
template <typename T>
bool EqualityCompare(T* lhs, T* rhs) {
  return lhs == rhs || (lhs != nullptr && rhs != nullptr && *lhs == *rhs);
}

}  // namespace firestore
}  // namespace firebase

#endif  // FIREBASE_FIRESTORE_SRC_COMMON_UTIL_H_
