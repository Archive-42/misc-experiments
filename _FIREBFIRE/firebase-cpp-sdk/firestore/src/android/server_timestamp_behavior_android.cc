/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *

#include "firestore/src/jni/env.h"
#include "firestore/src/jni/loader.h"

namespace firebase {
namespace firestore {
namespace {

using jni::Env;
using jni::Local;
using jni::Object;
using jni::StaticField;

using ServerTimestampBehavior = DocumentSnapshot::ServerTimestampBehavior;

constexpr char kClass[] = PROGUARD_KEEP_CLASS
    "com/google/firebase/firestore/DocumentSnapshot$ServerTimestampBehavior";

StaticField<Object> kNone(
    "NONE",
    "Lcom/google/firebase/firestore/DocumentSnapshot$ServerTimestampBehavior;");
StaticField<Object> kEstimate(
    "ESTIMATE",
    "Lcom/google/firebase/firestore/DocumentSnapshot$ServerTimestampBehavior;");
StaticField<Object> kPrevious(
    "PREVIOUS",
    "Lcom/google/firebase/firestore/DocumentSnapshot$ServerTimestampBehavior;");

}  // namespace

Local<Object> ServerTimestampBehaviorInternal::Create(
    Env& env, ServerTimestampBehavior stb) {
  static_assert(
      ServerTimestampBehavior::kDefault == ServerTimestampBehavior::kNone,
      "default should be the same as none");

  switch (stb) {
    case ServerTimestampBehavior::kNone:
      return env.Get(kNone);
    case ServerTimestampBehavior::kEstimate:
      return env.Get(kEstimate);
    case ServerTimestampBehavior::kPrevious:
      return env.Get(kPrevious);
  }
}

void ServerTimestampBehaviorInternal::Initialize(jni::Loader& loader) {
  loader.LoadClass(kClass, kNone, kEstimate, kPrevious);
}

}  // namespace firestore
}  // namespace firebase
