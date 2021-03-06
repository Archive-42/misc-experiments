/*
 *
 * Copyright 2016 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
EDENTIALS_H
#define GRPC_TEST_CPP_UTIL_CLI_CREDENTIALS_H

#include <grpcpp/security/credentials.h>
#include <grpcpp/support/config.h>

namespace grpc {
namespace testing {

class CliCredentials {
 public:
  virtual ~CliCredentials() {}
  std::shared_ptr<grpc::ChannelCredentials> GetCredentials() const;
  virtual const grpc::string GetCredentialUsage() const;
  virtual const grpc::string GetSslTargetNameOverride() const;

 protected:
  // Returns the appropriate channel_creds_type value for the set of legacy
  // flag arguments.
  virtual grpc::string GetDefaultChannelCredsType() const;
  // Returns the appropriate call_creds value for the set of legacy flag
  // arguments.
  virtual grpc::string GetDefaultCallCreds() const;
  // Returns the base transport channel credentials. Child classes can override
  // to support additional channel_creds_types unknown to this base class.
  virtual std::shared_ptr<grpc::ChannelCredentials> GetChannelCredentials()
      const;
  // Returns call credentials to composite onto the base transport channel
  // credentials. Child classes can override to support additional
  // authentication flags unknown to this base class.
  virtual std::shared_ptr<grpc::CallCredentials> GetCallCredentials() const;
};

}  // namespace testing
}  // namespace grpc

#endif  // GRPC_TEST_CPP_UTIL_CLI_CREDENTIALS_H
