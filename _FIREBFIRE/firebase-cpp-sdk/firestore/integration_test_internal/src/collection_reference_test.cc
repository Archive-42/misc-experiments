/*
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *

#include "firebase/firestore.h"
#include "firestore/src/common/wrapper_assertions.h"
#if defined(__ANDROID__)
#include "firestore/src/android/collection_reference_android.h"
#endif  // defined(__ANDROID__)

#include "gmock/gmock.h"
#include "gtest/gtest.h"

namespace firebase {
namespace firestore {

#if defined(__ANDROID__)

using CollectionReferenceTest = testing::Test;

TEST_F(CollectionReferenceTest, Construction) {
  testutil::AssertWrapperConstructionContract<CollectionReference,
                                              CollectionReferenceInternal>();
}

TEST_F(CollectionReferenceTest, Assignment) {
  testutil::AssertWrapperAssignmentContract<CollectionReference,
                                            CollectionReferenceInternal>();
}

#endif  // defined(__ANDROID__)

}  // namespace firestore
}  // namespace firebase
