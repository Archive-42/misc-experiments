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
ENT_HELPER_H
#define GRPC_TEST_CPP_INTEROP_CLIENT_HELPER_H

#include <functional>
#include <memory>
#include <unordered_map>

#include <grpcpp/channel.h>
#include <grpcpp/client_context.h>

#include "src/core/lib/surface/call_test_only.h"

namespace grpc {
namespace testing {

grpc::string GetServiceAccountJsonKey();

grpc::string GetOauth2AccessToken();

void UpdateActions(
    std::unordered_map<grpc::string, std::function<bool()>>* actions);

std::shared_ptr<Channel> CreateChannelForTestCase(
    const grpc::string& test_case,
    std::vector<
        std::unique_ptr<experimental::ClientInterceptorFactoryInterface>>
        interceptor_creators = {});

class InteropClientContextInspector {
 public:
  InteropClientContextInspector(const ::grpc::ClientContext& context)
      : context_(context) {}

  // Inspector methods, able to peek inside ClientContext, follow.
  grpc_compression_algorithm GetCallCompressionAlgorithm() const {
    return grpc_call_test_only_get_compression_algorithm(context_.call_);
  }

  uint32_t GetMessageFlags() const {
    return grpc_call_test_only_get_message_flags(context_.call_);
  }

 private:
  const ::grpc::ClientContext& context_;
};

class AdditionalMetadataInterceptor : public experimental::Interceptor {
 public:
  AdditionalMetadataInterceptor(
      std::multimap<grpc::string, grpc::string> additional_metadata)
      : additional_metadata_(std::move(additional_metadata)) {}

  void Intercept(experimental::InterceptorBatchMethods* methods) override {
    if (methods->QueryInterceptionHookPoint(
            experimental::InterceptionHookPoints::PRE_SEND_INITIAL_METADATA)) {
      std::multimap<grpc::string, grpc::string>* metadata =
          methods->GetSendInitialMetadata();
      for (const auto& entry : additional_metadata_) {
        metadata->insert(entry);
      }
    }
    methods->Proceed();
  }

 private:
  const std::multimap<grpc::string, grpc::string> additional_metadata_;
};

class AdditionalMetadataInterceptorFactory
    : public experimental::ClientInterceptorFactoryInterface {
 public:
  AdditionalMetadataInterceptorFactory(
      std::multimap<grpc::string, grpc::string> additional_metadata)
      : additional_metadata_(std::move(additional_metadata)) {}

  experimental::Interceptor* CreateClientInterceptor(
      experimental::ClientRpcInfo* /*info*/) override {
    return new AdditionalMetadataInterceptor(additional_metadata_);
  }

  const std::multimap<grpc::string, grpc::string> additional_metadata_;
};

}  // namespace testing
}  // namespace grpc

#endif  // GRPC_TEST_CPP_INTEROP_CLIENT_HELPER_H
