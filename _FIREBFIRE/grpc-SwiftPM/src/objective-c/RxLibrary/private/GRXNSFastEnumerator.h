/*
 *
 * Copyright 2015 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *


/**
 * This is a bridge to interact through NSEnumerator's interface with objects that only conform to
 * NSFastEnumeration. (There's nothing specifically fast about it - you certainly don't win any
 * speed by using this instead of a NSEnumerator provided by your container).
 */
@interface GRXNSFastEnumerator : NSEnumerator
/**
 * After the iteration of the container (via the NSFastEnumeration protocol) is over, the container
 * is released. If the container is modified during enumeration, an exception is thrown.
 */
- (instancetype)initWithContainer:(id<NSFastEnumeration>)container;
@end
