/*
 *
 * Copyright 2018 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
ENT_CHANNEL_RESOLVER_RESULT_PARSING_H
#define GRPC_CORE_EXT_FILTERS_CLIENT_CHANNEL_RESOLVER_RESULT_PARSING_H

#include <grpc/support/port_platform.h>

#include "absl/types/optional.h"

#include "src/core/ext/filters/client_channel/lb_policy.h"
#include "src/core/ext/filters/client_channel/lb_policy_factory.h"
#include "src/core/ext/filters/client_channel/resolver.h"
#include "src/core/ext/filters/client_channel/retry_throttle.h"
#include "src/core/ext/filters/client_channel/service_config.h"
#include "src/core/lib/channel/status_util.h"
#include "src/core/lib/gprpp/ref_counted.h"
#include "src/core/lib/gprpp/ref_counted_ptr.h"
#include "src/core/lib/iomgr/exec_ctx.h"  // for grpc_millis
#include "src/core/lib/json/json.h"

namespace grpc_core {
namespace internal {

class ClientChannelGlobalParsedConfig
    : public ServiceConfigParser::ParsedConfig {
 public:
  struct RetryThrottling {
    intptr_t max_milli_tokens = 0;
    intptr_t milli_token_ratio = 0;
  };

  ClientChannelGlobalParsedConfig(
      RefCountedPtr<LoadBalancingPolicy::Config> parsed_lb_config,
      std::string parsed_deprecated_lb_policy,
      const absl::optional<RetryThrottling>& retry_throttling,
      const char* health_check_service_name)
      : parsed_lb_config_(std::move(parsed_lb_config)),
        parsed_deprecated_lb_policy_(std::move(parsed_deprecated_lb_policy)),
        retry_throttling_(retry_throttling),
        health_check_service_name_(health_check_service_name) {}

  absl::optional<RetryThrottling> retry_throttling() const {
    return retry_throttling_;
  }

  RefCountedPtr<LoadBalancingPolicy::Config> parsed_lb_config() const {
    return parsed_lb_config_;
  }

  const std::string& parsed_deprecated_lb_policy() const {
    return parsed_deprecated_lb_policy_;
  }

  const char* health_check_service_name() const {
    return health_check_service_name_;
  }

 private:
  RefCountedPtr<LoadBalancingPolicy::Config> parsed_lb_config_;
  std::string parsed_deprecated_lb_policy_;
  absl::optional<RetryThrottling> retry_throttling_;
  const char* health_check_service_name_;
};

class ClientChannelMethodParsedConfig
    : public ServiceConfigParser::ParsedConfig {
 public:
  struct RetryPolicy {
    int max_attempts = 0;
    grpc_millis initial_backoff = 0;
    grpc_millis max_backoff = 0;
    float backoff_multiplier = 0;
    StatusCodeSet retryable_status_codes;
  };

  ClientChannelMethodParsedConfig(grpc_millis timeout,
                                  const absl::optional<bool>& wait_for_ready,
                                  std::unique_ptr<RetryPolicy> retry_policy)
      : timeout_(timeout),
        wait_for_ready_(wait_for_ready),
        retry_policy_(std::move(retry_policy)) {}

  grpc_millis timeout() const { return timeout_; }

  absl::optional<bool> wait_for_ready() const { return wait_for_ready_; }

  const RetryPolicy* retry_policy() const { return retry_policy_.get(); }

 private:
  grpc_millis timeout_ = 0;
  absl::optional<bool> wait_for_ready_;
  std::unique_ptr<RetryPolicy> retry_policy_;
};

class ClientChannelServiceConfigParser : public ServiceConfigParser::Parser {
 public:
  std::unique_ptr<ServiceConfigParser::ParsedConfig> ParseGlobalParams(
      const Json& json, grpc_error** error) override;

  std::unique_ptr<ServiceConfigParser::ParsedConfig> ParsePerMethodParams(
      const Json& json, grpc_error** error) override;

  static size_t ParserIndex();
  static void Register();
};

}  // namespace internal
}  // namespace grpc_core

#endif /* GRPC_CORE_EXT_FILTERS_CLIENT_CHANNEL_RESOLVER_RESULT_PARSING_H */
