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

 * A collection of 'macros' that help navigating the grpc object hierarchy
 * Not intended to be robust for main-line code, often cuts across abstraction
 * boundaries.
 */
#include <stdio.h>

#include "src/core/ext/filters/client_channel/client_channel.h"
#include "src/core/ext/transport/chttp2/transport/internal.h"
#include "src/core/lib/channel/connected_channel.h"
#include "src/core/lib/surface/call.h"

grpc_stream* grpc_transport_stream_from_call(grpc_call* call) {
  grpc_call_stack* cs = grpc_call_get_call_stack(call);
  for (;;) {
    grpc_call_element* el = grpc_call_stack_element(cs, cs->count - 1);
    if (el->filter == &grpc_client_channel_filter) {
      grpc_core::RefCountedPtr<grpc_core::SubchannelCall> scc =
          grpc_client_channel_get_subchannel_call(el);
      if (scc == nullptr) {
        fprintf(stderr, "No subchannel-call");
        fflush(stderr);
        return nullptr;
      }
      cs = scc->GetCallStack();
    } else if (el->filter == &grpc_connected_filter) {
      return grpc_connected_channel_get_stream(el);
    } else {
      fprintf(stderr, "Unrecognized filter: %s", el->filter->name);
      fflush(stderr);
      return nullptr;
    }
  }
}

grpc_chttp2_stream* grpc_chttp2_stream_from_call(grpc_call* call) {
  return reinterpret_cast<grpc_chttp2_stream*>(
      grpc_transport_stream_from_call(call));
}
