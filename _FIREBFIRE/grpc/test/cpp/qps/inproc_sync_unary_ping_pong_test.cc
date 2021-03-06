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


#include <grpc/support/log.h>

#include "test/core/util/test_config.h"
#include "test/cpp/qps/benchmark_config.h"
#include "test/cpp/qps/driver.h"
#include "test/cpp/qps/report.h"
#include "test/cpp/qps/server.h"
#include "test/cpp/util/test_config.h"
#include "test/cpp/util/test_credentials_provider.h"

namespace grpc {
namespace testing {

static const int WARMUP = 5;
static const int BENCHMARK = 5;

static void RunSynchronousUnaryPingPong() {
  gpr_log(GPR_INFO, "Running Synchronous Unary Ping Pong");

  ClientConfig client_config;
  client_config.set_client_type(SYNC_CLIENT);
  client_config.set_outstanding_rpcs_per_channel(1);
  client_config.set_client_channels(1);
  client_config.set_rpc_type(UNARY);
  client_config.mutable_load_params()->mutable_closed_loop();

  ServerConfig server_config;
  server_config.set_server_type(SYNC_SERVER);

  const auto result =
      RunScenario(client_config, 1, server_config, 1, WARMUP, BENCHMARK, -2, "",
                  kInsecureCredentialsType, {}, true, 0);

  GetReporter()->ReportQPS(*result);
  GetReporter()->ReportLatency(*result);
}

}  // namespace testing
}  // namespace grpc

int main(int argc, char** argv) {
  grpc::testing::TestEnvironment env(argc, argv);
  grpc::testing::InitTest(&argc, &argv, true);

  grpc::testing::RunSynchronousUnaryPingPong();

  return 0;
}
