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
orm.h>

#include "src/core/ext/xds/xds_channel.h"

#include <string.h>

#include "absl/container/inlined_vector.h"

#include <grpc/grpc_security.h>
#include <grpc/support/alloc.h>
#include <grpc/support/string_util.h>

#include "src/core/lib/channel/channel_args.h"
#include "src/core/lib/gpr/string.h"
#include "src/core/lib/iomgr/sockaddr_utils.h"
#include "src/core/lib/security/credentials/credentials.h"
#include "src/core/lib/security/credentials/fake/fake_credentials.h"
#include "src/core/lib/slice/slice_internal.h"

namespace grpc_core {

grpc_channel_args* ModifyXdsChannelArgs(grpc_channel_args* args) {
  absl::InlinedVector<const char*, 1> args_to_remove;
  absl::InlinedVector<grpc_arg, 2> args_to_add;
  // Substitute the channel credentials with a version without call
  // credentials: the load balancer is not necessarily trusted to handle
  // bearer token credentials.
  grpc_channel_credentials* channel_credentials =
      grpc_channel_credentials_find_in_args(args);
  RefCountedPtr<grpc_channel_credentials> creds_sans_call_creds;
  if (channel_credentials != nullptr) {
    creds_sans_call_creds =
        channel_credentials->duplicate_without_call_credentials();
    GPR_ASSERT(creds_sans_call_creds != nullptr);
    args_to_remove.emplace_back(GRPC_ARG_CHANNEL_CREDENTIALS);
    args_to_add.emplace_back(
        grpc_channel_credentials_to_arg(creds_sans_call_creds.get()));
  }
  grpc_channel_args* result = grpc_channel_args_copy_and_add_and_remove(
      args, args_to_remove.data(), args_to_remove.size(), args_to_add.data(),
      args_to_add.size());
  // Clean up.
  grpc_channel_args_destroy(args);
  return result;
}

grpc_channel* CreateXdsChannel(const XdsBootstrap& bootstrap,
                               const grpc_channel_args& args,
                               grpc_error** error) {
  grpc_channel_credentials* creds = nullptr;
  RefCountedPtr<grpc_channel_credentials> creds_to_unref;
  if (!bootstrap.server().channel_creds.empty()) {
    for (size_t i = 0; i < bootstrap.server().channel_creds.size(); ++i) {
      if (bootstrap.server().channel_creds[i].type == "google_default") {
        creds = grpc_google_default_credentials_create(nullptr);
        break;
      } else if (bootstrap.server().channel_creds[i].type == "fake") {
        creds = grpc_fake_transport_security_credentials_create();
        break;
      }
    }
    if (creds == nullptr) {
      *error = GRPC_ERROR_CREATE_FROM_STATIC_STRING(
          "no supported credential types found");
      return nullptr;
    }
    creds_to_unref.reset(creds);
  } else {
    creds = grpc_channel_credentials_find_in_args(&args);
    if (creds == nullptr) {
      // Built with security but parent channel is insecure.
      return grpc_insecure_channel_create(bootstrap.server().server_uri.c_str(),
                                          &args, nullptr);
    }
  }
  const char* arg_to_remove = GRPC_ARG_CHANNEL_CREDENTIALS;
  grpc_channel_args* new_args =
      grpc_channel_args_copy_and_remove(&args, &arg_to_remove, 1);
  grpc_channel* channel = grpc_secure_channel_create(
      creds, bootstrap.server().server_uri.c_str(), new_args, nullptr);
  grpc_channel_args_destroy(new_args);
  return channel;
}

}  // namespace grpc_core
