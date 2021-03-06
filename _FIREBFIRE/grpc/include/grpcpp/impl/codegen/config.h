/*
 *
 * Copyright 2016 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
G_H
#define GRPCPP_IMPL_CODEGEN_CONFIG_H

#include <string>

/// The following macros are deprecated and appear only for users
/// with PB files generated using gRPC 1.0.x plugins. They should
/// not be used in new code
#define GRPC_OVERRIDE override  // deprecated
#define GRPC_FINAL final        // deprecated

#ifdef GRPC_CUSTOM_STRING
#warning GRPC_CUSTOM_STRING is no longer supported. Please use std::string.
#endif

namespace grpc {

// Using grpc::string and grpc::to_string is discouraged in favor of
// std::string and std::to_string. This is only for legacy code using
// them explictly.
using std::string;     // deprecated
using std::to_string;  // deprecated

}  // namespace grpc

#endif  // GRPCPP_IMPL_CODEGEN_CONFIG_H
