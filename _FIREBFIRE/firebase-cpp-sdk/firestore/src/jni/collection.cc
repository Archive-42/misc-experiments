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
#include "firestore/src/jni/iterator.h"
#include "firestore/src/jni/loader.h"

namespace firebase {
namespace firestore {
namespace jni {
namespace {

constexpr char kClass[] = "java/util/Collection";
Method<bool> kAdd("add", "(Ljava/lang/Object;)Z");
Method<Iterator> kIterator("iterator", "()Ljava/util/Iterator;");
Method<size_t> kSize("size", "()I");

}  // namespace

void Collection::Initialize(Loader& loader) {
  loader.LoadClass(kClass, kAdd, kIterator, kSize);
}

bool Collection::Add(Env& env, const Object& object) {
  return env.Call(*this, kAdd, object);
}

Local<Iterator> Collection::Iterator(Env& env) {
  return env.Call(*this, kIterator);
}

size_t Collection::Size(Env& env) const { return env.Call(*this, kSize); }

}  // namespace jni
}  // namespace firestore
}  // namespace firebase
