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


#include <grpcpp/channel.h>

#include "src/proto/grpc/testing/echo.grpc.pb.h"
#include "test/cpp/util/string_ref_helper.h"

#include <gtest/gtest.h>

namespace grpc {
namespace testing {
/* This interceptor does nothing. Just keeps a global count on the number of
 * times it was invoked. */
class DummyInterceptor : public experimental::Interceptor {
 public:
  DummyInterceptor() {}

  virtual void Intercept(experimental::InterceptorBatchMethods* methods) {
    if (methods->QueryInterceptionHookPoint(
            experimental::InterceptionHookPoints::PRE_SEND_INITIAL_METADATA)) {
      num_times_run_++;
    } else if (methods->QueryInterceptionHookPoint(
                   experimental::InterceptionHookPoints::
                       POST_RECV_INITIAL_METADATA)) {
      num_times_run_reverse_++;
    } else if (methods->QueryInterceptionHookPoint(
                   experimental::InterceptionHookPoints::PRE_SEND_CANCEL)) {
      num_times_cancel_++;
    }
    methods->Proceed();
  }

  static void Reset() {
    num_times_run_.store(0);
    num_times_run_reverse_.store(0);
    num_times_cancel_.store(0);
  }

  static int GetNumTimesRun() {
    EXPECT_EQ(num_times_run_.load(), num_times_run_reverse_.load());
    return num_times_run_.load();
  }

  static int GetNumTimesCancel() { return num_times_cancel_.load(); }

 private:
  static std::atomic<int> num_times_run_;
  static std::atomic<int> num_times_run_reverse_;
  static std::atomic<int> num_times_cancel_;
};

class DummyInterceptorFactory
    : public experimental::ClientInterceptorFactoryInterface,
      public experimental::ServerInterceptorFactoryInterface {
 public:
  virtual experimental::Interceptor* CreateClientInterceptor(
      experimental::ClientRpcInfo* /*info*/) override {
    return new DummyInterceptor();
  }

  virtual experimental::Interceptor* CreateServerInterceptor(
      experimental::ServerRpcInfo* /*info*/) override {
    return new DummyInterceptor();
  }
};

/* This interceptor factory returns nullptr on interceptor creation */
class NullInterceptorFactory
    : public experimental::ClientInterceptorFactoryInterface,
      public experimental::ServerInterceptorFactoryInterface {
 public:
  virtual experimental::Interceptor* CreateClientInterceptor(
      experimental::ClientRpcInfo* /*info*/) override {
    return nullptr;
  }

  virtual experimental::Interceptor* CreateServerInterceptor(
      experimental::ServerRpcInfo* /*info*/) override {
    return nullptr;
  }
};

class EchoTestServiceStreamingImpl : public EchoTestService::Service {
 public:
  ~EchoTestServiceStreamingImpl() override {}

  Status Echo(ServerContext* context, const EchoRequest* request,
              EchoResponse* response) override {
    auto client_metadata = context->client_metadata();
    for (const auto& pair : client_metadata) {
      context->AddTrailingMetadata(ToString(pair.first), ToString(pair.second));
    }
    response->set_message(request->message());
    return Status::OK;
  }

  Status BidiStream(
      ServerContext* context,
      grpc::ServerReaderWriter<EchoResponse, EchoRequest>* stream) override {
    EchoRequest req;
    EchoResponse resp;
    auto client_metadata = context->client_metadata();
    for (const auto& pair : client_metadata) {
      context->AddTrailingMetadata(ToString(pair.first), ToString(pair.second));
    }

    while (stream->Read(&req)) {
      resp.set_message(req.message());
      EXPECT_TRUE(stream->Write(resp, grpc::WriteOptions()));
    }
    return Status::OK;
  }

  Status RequestStream(ServerContext* context,
                       ServerReader<EchoRequest>* reader,
                       EchoResponse* resp) override {
    auto client_metadata = context->client_metadata();
    for (const auto& pair : client_metadata) {
      context->AddTrailingMetadata(ToString(pair.first), ToString(pair.second));
    }

    EchoRequest req;
    string response_str = "";
    while (reader->Read(&req)) {
      response_str += req.message();
    }
    resp->set_message(response_str);
    return Status::OK;
  }

  Status ResponseStream(ServerContext* context, const EchoRequest* req,
                        ServerWriter<EchoResponse>* writer) override {
    auto client_metadata = context->client_metadata();
    for (const auto& pair : client_metadata) {
      context->AddTrailingMetadata(ToString(pair.first), ToString(pair.second));
    }

    EchoResponse resp;
    resp.set_message(req->message());
    for (int i = 0; i < 10; i++) {
      EXPECT_TRUE(writer->Write(resp));
    }
    return Status::OK;
  }
};

constexpr int kNumStreamingMessages = 10;

void MakeCall(const std::shared_ptr<Channel>& channel);

void MakeClientStreamingCall(const std::shared_ptr<Channel>& channel);

void MakeServerStreamingCall(const std::shared_ptr<Channel>& channel);

void MakeBidiStreamingCall(const std::shared_ptr<Channel>& channel);

void MakeAsyncCQCall(const std::shared_ptr<Channel>& channel);

void MakeAsyncCQClientStreamingCall(const std::shared_ptr<Channel>& channel);

void MakeAsyncCQServerStreamingCall(const std::shared_ptr<Channel>& channel);

void MakeAsyncCQBidiStreamingCall(const std::shared_ptr<Channel>& channel);

void MakeCallbackCall(const std::shared_ptr<Channel>& channel);

bool CheckMetadata(const std::multimap<grpc::string_ref, grpc::string_ref>& map,
                   const string& key, const string& value);

bool CheckMetadata(const std::multimap<std::string, std::string>& map,
                   const string& key, const string& value);

std::vector<std::unique_ptr<experimental::ClientInterceptorFactoryInterface>>
CreateDummyClientInterceptors();

inline void* tag(int i) { return (void*)static_cast<intptr_t>(i); }
inline int detag(void* p) {
  return static_cast<int>(reinterpret_cast<intptr_t>(p));
}

class Verifier {
 public:
  Verifier() : lambda_run_(false) {}
  // Expect sets the expected ok value for a specific tag
  Verifier& Expect(int i, bool expect_ok) {
    return ExpectUnless(i, expect_ok, false);
  }
  // ExpectUnless sets the expected ok value for a specific tag
  // unless the tag was already marked seen (as a result of ExpectMaybe)
  Verifier& ExpectUnless(int i, bool expect_ok, bool seen) {
    if (!seen) {
      expectations_[tag(i)] = expect_ok;
    }
    return *this;
  }
  // ExpectMaybe sets the expected ok value for a specific tag, but does not
  // require it to appear
  // If it does, sets *seen to true
  Verifier& ExpectMaybe(int i, bool expect_ok, bool* seen) {
    if (!*seen) {
      maybe_expectations_[tag(i)] = MaybeExpect{expect_ok, seen};
    }
    return *this;
  }

  // Next waits for 1 async tag to complete, checks its
  // expectations, and returns the tag
  int Next(CompletionQueue* cq, bool ignore_ok) {
    bool ok;
    void* got_tag;
    EXPECT_TRUE(cq->Next(&got_tag, &ok));
    GotTag(got_tag, ok, ignore_ok);
    return detag(got_tag);
  }

  template <typename T>
  CompletionQueue::NextStatus DoOnceThenAsyncNext(
      CompletionQueue* cq, void** got_tag, bool* ok, T deadline,
      std::function<void(void)> lambda) {
    if (lambda_run_) {
      return cq->AsyncNext(got_tag, ok, deadline);
    } else {
      lambda_run_ = true;
      return cq->DoThenAsyncNext(lambda, got_tag, ok, deadline);
    }
  }

  // Verify keeps calling Next until all currently set
  // expected tags are complete
  void Verify(CompletionQueue* cq) { Verify(cq, false); }

  // This version of Verify allows optionally ignoring the
  // outcome of the expectation
  void Verify(CompletionQueue* cq, bool ignore_ok) {
    GPR_ASSERT(!expectations_.empty() || !maybe_expectations_.empty());
    while (!expectations_.empty()) {
      Next(cq, ignore_ok);
    }
  }

  // This version of Verify stops after a certain deadline, and uses the
  // DoThenAsyncNext API
  // to call the lambda
  void Verify(CompletionQueue* cq,
              std::chrono::system_clock::time_point deadline,
              const std::function<void(void)>& lambda) {
    if (expectations_.empty()) {
      bool ok;
      void* got_tag;
      EXPECT_EQ(DoOnceThenAsyncNext(cq, &got_tag, &ok, deadline, lambda),
                CompletionQueue::TIMEOUT);
    } else {
      while (!expectations_.empty()) {
        bool ok;
        void* got_tag;
        EXPECT_EQ(DoOnceThenAsyncNext(cq, &got_tag, &ok, deadline, lambda),
                  CompletionQueue::GOT_EVENT);
        GotTag(got_tag, ok, false);
      }
    }
  }

 private:
  void GotTag(void* got_tag, bool ok, bool ignore_ok) {
    auto it = expectations_.find(got_tag);
    if (it != expectations_.end()) {
      if (!ignore_ok) {
        EXPECT_EQ(it->second, ok);
      }
      expectations_.erase(it);
    } else {
      auto it2 = maybe_expectations_.find(got_tag);
      if (it2 != maybe_expectations_.end()) {
        if (it2->second.seen != nullptr) {
          EXPECT_FALSE(*it2->second.seen);
          *it2->second.seen = true;
        }
        if (!ignore_ok) {
          EXPECT_EQ(it2->second.ok, ok);
        }
      } else {
        gpr_log(GPR_ERROR, "Unexpected tag: %p", got_tag);
        abort();
      }
    }
  }

  struct MaybeExpect {
    bool ok;
    bool* seen;
  };

  std::map<void*, bool> expectations_;
  std::map<void*, MaybeExpect> maybe_expectations_;
  bool lambda_run_;
};

}  // namespace testing
}  // namespace grpc
