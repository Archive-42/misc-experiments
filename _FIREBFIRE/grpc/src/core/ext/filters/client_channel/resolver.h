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
ENT_CHANNEL_RESOLVER_H
#define GRPC_CORE_EXT_FILTERS_CLIENT_CHANNEL_RESOLVER_H

#include <grpc/support/port_platform.h>

#include <grpc/impl/codegen/grpc_types.h>

#include "src/core/ext/filters/client_channel/server_address.h"
#include "src/core/ext/filters/client_channel/service_config.h"
#include "src/core/lib/gprpp/orphanable.h"
#include "src/core/lib/gprpp/ref_counted_ptr.h"
#include "src/core/lib/iomgr/iomgr.h"
#include "src/core/lib/iomgr/work_serializer.h"

extern grpc_core::DebugOnlyTraceFlag grpc_trace_resolver_refcount;

namespace grpc_core {

/// Interface for name resolution.
///
/// This interface is designed to support both push-based and pull-based
/// mechanisms.  A push-based mechanism is one where the resolver will
/// subscribe to updates for a given name, and the name service will
/// proactively send new data to the resolver whenever the data associated
/// with the name changes.  A pull-based mechanism is one where the resolver
/// needs to query the name service again to get updated information (e.g.,
/// DNS).
///
/// Note: All methods with a "Locked" suffix must be called from the
/// work_serializer passed to the constructor.
class Resolver : public InternallyRefCounted<Resolver> {
 public:
  /// Results returned by the resolver.
  struct Result {
    ServerAddressList addresses;
    RefCountedPtr<ServiceConfig> service_config;
    grpc_error* service_config_error = GRPC_ERROR_NONE;
    const grpc_channel_args* args = nullptr;

    // TODO(roth): Remove everything below once grpc_error and
    // grpc_channel_args are convert to copyable and movable C++ objects.
    Result() = default;
    ~Result();
    Result(const Result& other);
    Result(Result&& other) noexcept;
    Result& operator=(const Result& other);
    Result& operator=(Result&& other) noexcept;
  };

  /// A proxy object used by the resolver to return results to the
  /// client channel.
  class ResultHandler {
   public:
    virtual ~ResultHandler() {}

    /// Returns a result to the channel.
    /// Takes ownership of \a result.args.
    virtual void ReturnResult(Result result) = 0;  // NOLINT

    /// Returns a transient error to the channel.
    /// If the resolver does not set the GRPC_ERROR_INT_GRPC_STATUS
    /// attribute on the error, calls will be failed with status UNKNOWN.
    virtual void ReturnError(grpc_error* error) = 0;

    // TODO(yashkt): As part of the service config error handling
    // changes, add a method to parse the service config JSON string.
  };

  // Not copyable nor movable.
  Resolver(const Resolver&) = delete;
  Resolver& operator=(const Resolver&) = delete;
  virtual ~Resolver() = default;

  /// Starts resolving.
  virtual void StartLocked() = 0;

  /// Asks the resolver to obtain an updated resolver result, if
  /// applicable.
  ///
  /// This is useful for pull-based implementations to decide when to
  /// re-resolve.  However, the implementation is not required to
  /// re-resolve immediately upon receiving this call; it may instead
  /// elect to delay based on some configured minimum time between
  /// queries, to avoid hammering the name service with queries.
  ///
  /// For push-based implementations, this may be a no-op.
  ///
  /// Note: Implementations must not invoke any method on the
  /// ResultHandler from within this call.
  virtual void RequestReresolutionLocked() {}

  /// Resets the re-resolution backoff, if any.
  /// This needs to be implemented only by pull-based implementations;
  /// for push-based implementations, it will be a no-op.
  /// TODO(roth): Pull the backoff code out of resolver and into
  /// client_channel, so that it can be shared across resolver
  /// implementations.  At that point, this method can go away.
  virtual void ResetBackoffLocked() {}

  // Note: This must be invoked while holding the work_serializer.
  void Orphan() override {
    ShutdownLocked();
    Unref();
  }

 protected:
  Resolver(std::shared_ptr<WorkSerializer> work_serializer,
           std::unique_ptr<ResultHandler> result_handler);

  /// Shuts down the resolver.
  virtual void ShutdownLocked() = 0;

  std::shared_ptr<WorkSerializer> work_serializer() const {
    return work_serializer_;
  }

  ResultHandler* result_handler() const { return result_handler_.get(); }

 private:
  std::shared_ptr<WorkSerializer> work_serializer_;
  std::unique_ptr<ResultHandler> result_handler_;
};

}  // namespace grpc_core

#endif /* GRPC_CORE_EXT_FILTERS_CLIENT_CHANNEL_RESOLVER_H */
