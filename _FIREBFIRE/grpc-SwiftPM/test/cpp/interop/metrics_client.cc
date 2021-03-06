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

#include <string>

#include <gflags/gflags.h>
#include <grpc/support/log.h>
#include <grpcpp/grpcpp.h>

#include "src/proto/grpc/testing/metrics.grpc.pb.h"
#include "src/proto/grpc/testing/metrics.pb.h"
#include "test/cpp/util/metrics_server.h"
#include "test/cpp/util/test_config.h"

int kDeadlineSecs = 10;

DEFINE_string(metrics_server_address, "localhost:8081",
              "The metrics server addresses in the fomrat <hostname>:<port>");
DEFINE_int32(deadline_secs, kDeadlineSecs,
             "The deadline (in seconds) for RCP call");
DEFINE_bool(total_only, false,
            "If true, this prints only the total value of all gauges");

using grpc::testing::EmptyMessage;
using grpc::testing::GaugeResponse;
using grpc::testing::MetricsService;
using grpc::testing::MetricsServiceImpl;

// Do not log anything
void BlackholeLogger(gpr_log_func_args* /*args*/) {}

// Prints the values of all Gauges (unless total_only is set to 'true' in which
// case this only prints the sum of all gauge values).
bool PrintMetrics(std::unique_ptr<MetricsService::Stub> stub, bool total_only,
                  int deadline_secs) {
  grpc::ClientContext context;
  EmptyMessage message;

  std::chrono::system_clock::time_point deadline =
      std::chrono::system_clock::now() + std::chrono::seconds(deadline_secs);

  context.set_deadline(deadline);

  std::unique_ptr<grpc::ClientReader<GaugeResponse>> reader(
      stub->GetAllGauges(&context, message));

  GaugeResponse gauge_response;
  long overall_qps = 0;
  while (reader->Read(&gauge_response)) {
    if (gauge_response.value_case() == GaugeResponse::kLongValue) {
      if (!total_only) {
        std::cout << gauge_response.name() << ": "
                  << gauge_response.long_value() << std::endl;
      }
      overall_qps += gauge_response.long_value();
    } else {
      std::cout << "Gauge '" << gauge_response.name() << "' is not long valued"
                << std::endl;
    }
  }

  std::cout << overall_qps << std::endl;

  const grpc::Status status = reader->Finish();
  if (!status.ok()) {
    std::cout << "Error in getting metrics from the client" << std::endl;
  }

  return status.ok();
}

int main(int argc, char** argv) {
  grpc::testing::InitTest(&argc, &argv, true);

  // The output of metrics client is in some cases programmatically parsed (for
  // example by the stress test framework). So, we do not want any of the log
  // from the grpc library appearing on stdout.
  gpr_set_log_function(BlackholeLogger);

  std::shared_ptr<grpc::Channel> channel(grpc::CreateChannel(
      FLAGS_metrics_server_address, grpc::InsecureChannelCredentials()));

  if (!PrintMetrics(MetricsService::NewStub(channel), FLAGS_total_only,
                    FLAGS_deadline_secs)) {
    return 1;
  }

  return 0;
}
