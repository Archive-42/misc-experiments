/*
 *
 * Copyright 2019 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *

#define TESTHELPER_H

#import <XCTest/XCTest.h>
#import <map>
#import <sstream>

#import <grpc/support/time.h>
#import <grpcpp/impl/codegen/config.h>
#import <grpcpp/impl/codegen/string_ref.h>
#import <grpcpp/support/client_interceptor.h>
#import <src/proto/grpc/testing/echo.grpc.pb.h>

const char* const kServerFinishAfterNReads = "server_finish_after_n_reads";
const char* const kServerResponseStreamsToSend = "server_responses_to_send";
const int kServerDefaultResponseStreamsToSend = 3;
const char* const kDebugInfoTrailerKey = "debug-info-bin";

grpc::string ToString(const grpc::string_ref& r);
void configureCronet(void);
bool CheckIsLocalhost(const grpc::string& addr);

class DummyInterceptor : public grpc::experimental::Interceptor {
 public:
  DummyInterceptor() {}
  virtual void Intercept(grpc::experimental::InterceptorBatchMethods* methods);
  static void Reset();
  static int GetNumTimesRun();

 private:
  static std::atomic<int> num_times_run_;
  static std::atomic<int> num_times_run_reverse_;
};

class DummyInterceptorFactory
    : public grpc::experimental::ClientInterceptorFactoryInterface {
 public:
  virtual grpc::experimental::Interceptor* CreateClientInterceptor(
      grpc::experimental::ClientRpcInfo* info) override {
    return new DummyInterceptor();
  }
};

class TestServiceImpl : public grpc::testing::EchoTestService::Service {
 public:
  grpc::Status Echo(grpc::ServerContext* context,
                    const grpc::testing::EchoRequest* request,
                    grpc::testing::EchoResponse* response);
  grpc::Status RequestStream(
      grpc::ServerContext* context,
      grpc::ServerReader<grpc::testing::EchoRequest>* reader,
      grpc::testing::EchoResponse* response);
  grpc::Status ResponseStream(
      grpc::ServerContext* context, const grpc::testing::EchoRequest* request,
      grpc::ServerWriter<grpc::testing::EchoResponse>* writer);

  grpc::Status BidiStream(
      grpc::ServerContext* context,
      grpc::ServerReaderWriter<grpc::testing::EchoResponse,
                               grpc::testing::EchoRequest>* stream);
};

#endif /* TESTHELPER_H */
