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


#include <grpcpp/channel.h>

struct grpc_channel;

namespace grpc {

std::shared_ptr<Channel> CreateChannelInternal(
    const std::string& host, grpc_channel* c_channel,
    std::vector<std::unique_ptr<
        ::grpc::experimental::ClientInterceptorFactoryInterface>>
        interceptor_creators) {
  return std::shared_ptr<Channel>(
      new Channel(host, c_channel, std::move(interceptor_creators)));
}

}  // namespace grpc
