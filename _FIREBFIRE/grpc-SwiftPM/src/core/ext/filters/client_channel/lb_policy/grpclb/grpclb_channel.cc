/*
 *
 * Copyright 2017 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
orm.h>

#include <grpc/grpc.h>

#include "src/core/ext/filters/client_channel/lb_policy/grpclb/grpclb_channel.h"

namespace grpc_core {

grpc_channel_args* ModifyGrpclbBalancerChannelArgs(
    const ServerAddressList& /*addresses*/, grpc_channel_args* args) {
  return args;
}

grpc_channel* CreateGrpclbBalancerChannel(const char* target_uri,
                                          const grpc_channel_args& args) {
  return grpc_insecure_channel_create(target_uri, &args, nullptr);
}

}  // namespace grpc_core
