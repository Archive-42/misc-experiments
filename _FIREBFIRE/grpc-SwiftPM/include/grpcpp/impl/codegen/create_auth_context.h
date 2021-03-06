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
E_AUTH_CONTEXT_H
#define GRPCPP_IMPL_CODEGEN_CREATE_AUTH_CONTEXT_H

#include <memory>

#include <grpc/impl/codegen/grpc_types.h>
#include <grpcpp/impl/codegen/security/auth_context.h>

namespace grpc {

std::shared_ptr<const AuthContext> CreateAuthContext(grpc_call* call);

}  // namespace grpc

#endif  // GRPCPP_IMPL_CODEGEN_CREATE_AUTH_CONTEXT_H
