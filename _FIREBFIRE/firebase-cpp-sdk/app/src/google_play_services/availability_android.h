/*
 * Copyright 2016 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
LAY_SERVICES_AVAILABILITY_ANDROID_H_

#include <jni.h>

#include "app/src/include/google_play_services/availability.h"

namespace google_play_services {

// Initialize the Google Play services availability checker.
bool Initialize(JNIEnv* env, jobject activity);

// Terminate the Google Play services availability checker, releasing classes.
void Terminate(JNIEnv* env);

}  // namespace google_play_services

#endif  // FIREBASE_APP_SRC_GOOGLE_PLAY_SERVICES_AVAILABILITY_ANDROID_H_
