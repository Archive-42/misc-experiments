/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
I_JNI_FWD_H_

#include <jni.h>

namespace firebase {
namespace firestore {
namespace jni {

/**
 * Returns the `JNIEnv` pointer for the current thread.
 */
JNIEnv* GetEnv();

class Env;
class Loader;

// Reference types
template <typename T>
class Local;
template <typename T>
class Global;
template <typename T>
class NonOwning;

class Class;
class Object;
class String;
class Throwable;

template <typename T>
class Array;

// Declaration types
class ConstructorBase;
class MethodBase;
class StaticFieldBase;
class StaticMethodBase;

template <typename T>
class Constructor;
template <typename T>
class Method;
template <typename T>
class StaticField;
template <typename T>
class StaticMethod;

// Other elements of java.lang
class Boolean;
class Double;
class Integer;
class Long;

// Collections from java.util
class ArrayList;
class Collection;
class Iterator;
class List;
class HashMap;
class Map;

}  // namespace jni
}  // namespace firestore
}  // namespace firebase

#endif  // FIREBASE_FIRESTORE_SRC_JNI_JNI_FWD_H_
