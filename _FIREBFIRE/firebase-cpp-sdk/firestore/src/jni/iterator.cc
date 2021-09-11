/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *

#include "app/src/util_android.h"
#include "firestore/src/jni/env.h"
#include "firestore/src/jni/loader.h"

namespace firebase {
namespace firestore {
namespace jni {
namespace {

constexpr char kClass[] = "java/util/Iterator";
Method<bool> kHasNext("hasNext", "()Z");
Method<Object> kNext("next", "()Ljava/lang/Object;");

}  // namespace

void Iterator::Initialize(Loader& loader) {
  loader.LoadFromExistingClass(kClass, util::iterator::GetClass(), kHasNext,
                               kNext);
}

bool Iterator::HasNext(Env& env) const { return env.Call(*this, kHasNext); }

Local<Object> Iterator::Next(Env& env) { return env.Call(*this, kNext); }

}  // namespace jni
}  // namespace firestore
}  // namespace firebase
