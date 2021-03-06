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

#include <string>
#include <thread>  // NOLINT

#include "absl/base/call_once.h"
#include "absl/strings/str_cat.h"
#include "include/grpc/grpc.h"
#include "include/grpcpp/grpcpp.h"
#include "include/grpcpp/opencensus.h"
#include "opencensus/stats/stats.h"
#include "src/cpp/ext/filters/census/grpc_plugin.h"
#include "src/proto/grpc/testing/echo.grpc.pb.h"
#include "test/cpp/microbenchmarks/helpers.h"

using ::grpc::RegisterOpenCensusPlugin;
using ::grpc::RegisterOpenCensusViewsForExport;

absl::once_flag once;
void RegisterOnce() { absl::call_once(once, RegisterOpenCensusPlugin); }

class EchoServer final : public grpc::testing::EchoTestService::Service {
  grpc::Status Echo(grpc::ServerContext* context,
                    const grpc::testing::EchoRequest* request,
                    grpc::testing::EchoResponse* response) override {
    if (request->param().expected_error().code() == 0) {
      response->set_message(request->message());
      return grpc::Status::OK;
    } else {
      return grpc::Status(static_cast<grpc::StatusCode>(
                              request->param().expected_error().code()),
                          "");
    }
  }
};

// An EchoServerThread object creates an EchoServer on a separate thread and
// shuts down the server and thread when it goes out of scope.
class EchoServerThread final {
 public:
  EchoServerThread() {
    grpc::ServerBuilder builder;
    int port;
    builder.AddListeningPort("[::]:0", grpc::InsecureServerCredentials(),
                             &port);
    builder.RegisterService(&service_);
    server_ = builder.BuildAndStart();
    if (server_ == nullptr || port == 0) {
      std::abort();
    }
    server_address_ = absl::StrCat("[::]:", port);
    server_thread_ = std::thread(&EchoServerThread::RunServerLoop, this);
  }

  ~EchoServerThread() {
    server_->Shutdown();
    server_thread_.join();
  }

  const std::string& address() { return server_address_; }

 private:
  void RunServerLoop() { server_->Wait(); }

  std::string server_address_;
  EchoServer service_;
  std::unique_ptr<grpc::Server> server_;
  std::thread server_thread_;
};

static void BM_E2eLatencyCensusDisabled(benchmark::State& state) {
  EchoServerThread server;
  std::unique_ptr<grpc::testing::EchoTestService::Stub> stub =
      grpc::testing::EchoTestService::NewStub(grpc::CreateChannel(
          server.address(), grpc::InsecureChannelCredentials()));

  grpc::testing::EchoResponse response;
  for (auto _ : state) {
    grpc::testing::EchoRequest request;
    grpc::ClientContext context;
    grpc::Status status = stub->Echo(&context, request, &response);
  }
}
BENCHMARK(BM_E2eLatencyCensusDisabled);

static void BM_E2eLatencyCensusEnabled(benchmark::State& state) {
  // Avoid a data race between registering plugin and shutdown of previous
  // test (order-dependent) by doing an init/shutdown so that any previous
  // shutdowns are fully complete first.
  grpc_init();
  grpc_shutdown_blocking();

  // Now start the test by registering the plugin (once in the execution)
  RegisterOnce();
  // This we can safely repeat, and doing so clears accumulated data to avoid
  // initialization costs varying between runs.
  RegisterOpenCensusViewsForExport();

  EchoServerThread server;
  std::unique_ptr<grpc::testing::EchoTestService::Stub> stub =
      grpc::testing::EchoTestService::NewStub(grpc::CreateChannel(
          server.address(), grpc::InsecureChannelCredentials()));

  grpc::testing::EchoResponse response;
  for (auto _ : state) {
    grpc::testing::EchoRequest request;
    grpc::ClientContext context;
    grpc::Status status = stub->Echo(&context, request, &response);
  }
}
BENCHMARK(BM_E2eLatencyCensusEnabled);

BENCHMARK_MAIN();
