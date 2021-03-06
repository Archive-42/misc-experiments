/*
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *


#include "app/src/include/firebase/internal/type_traits.h"

namespace firebase {

// Casts the argument to an rvalue-reference.
//
// This is equivalent to C++11's std::move which is unavailable in STLPort.
template <typename T>
inline typename remove_reference<T>::type&& Move(T&& arg) {
  return static_cast<typename remove_reference<T>::type&&>(arg);
}

// Below is the implementation of C++11's std::forward which is unavailable in
// STLPort. See std::forward's documentation for details.

// Forward lvalue.
template <typename T>
inline T&& Forward(typename remove_reference<T>::type& arg) {  // NOLINT
  return static_cast<T&&>(arg);
}

// Forward rvalue.
template <typename T>
inline T&& Forward(typename remove_reference<T>::type&& arg) {
  static_assert(!is_lvalue_reference<T>::value,
                "can't forward an rvalue as an lvalue.");
  return static_cast<T&&>(arg);
}

// NOLINTNEXTLINE - allow namespace overridden
}  // namespace firebase

#endif  // FIREBASE_APP_META_MOVE_H_
