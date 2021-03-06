/*
 * Copyright 2017 Google
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *

#import "auth/src/ios/fake/FIRUser.h"
#import "auth/src/ios/fake/FIRAdditionalUserInfo.h"

NS_ASSUME_NONNULL_BEGIN

@implementation FIRAuthDataResult

- (instancetype)init {
  self = [super init];
  if (self) {
    _user = [[FIRUser alloc] init];
    _additionalUserInfo = [[FIRAdditionalUserInfo alloc] init];
  }
  return self;
}

@end

NS_ASSUME_NONNULL_END
