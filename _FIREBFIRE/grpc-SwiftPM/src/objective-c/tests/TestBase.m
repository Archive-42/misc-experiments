/*
 *
 * Copyright 2019 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *


@implementation TestBase : XCTestCase

+ (XCTestSuite *)defaultTestSuite {
  return super.defaultTestSuite;
}

+ (NSString *)host {
  return nil;
}

// This number indicates how many bytes of overhead does Protocol Buffers encoding add onto the
// message. The number varies as different message.proto is used on different servers. The actual
// number for each interop server is overridden in corresponding derived test classes.
- (int32_t)encodingOverhead {
  return 0;
}

+ (GRPCTransportID)transport {
  return NULL;
}

+ (NSString *)PEMRootCertificates {
  return nil;
}

+ (NSString *)hostNameOverride {
  return nil;
}

+ (BOOL)isRemoteTest {
  return NO;
}

@end
