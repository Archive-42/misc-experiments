/*
 *
 * Copyright 2017 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
orm.h>

#include <string.h>

#include "src/core/ext/filters/http/client/http_client_filter.h"
#include "src/core/ext/filters/http/message_compress/message_compress_filter.h"
#include "src/core/ext/filters/http/server/http_server_filter.h"
#include "src/core/lib/channel/channel_stack_builder.h"
#include "src/core/lib/surface/call.h"
#include "src/core/lib/surface/channel_init.h"
#include "src/core/lib/transport/transport_impl.h"

typedef struct {
  const grpc_channel_filter* filter;
  const char* control_channel_arg;
} optional_filter;

static optional_filter compress_filter = {
    &grpc_message_compress_filter, GRPC_ARG_ENABLE_PER_MESSAGE_COMPRESSION};

static bool is_building_http_like_transport(
    grpc_channel_stack_builder* builder) {
  grpc_transport* t = grpc_channel_stack_builder_get_transport(builder);
  return t != nullptr && strstr(t->vtable->name, "http");
}

static bool maybe_add_optional_filter(grpc_channel_stack_builder* builder,
                                      void* arg) {
  if (!is_building_http_like_transport(builder)) return true;
  optional_filter* filtarg = static_cast<optional_filter*>(arg);
  const grpc_channel_args* channel_args =
      grpc_channel_stack_builder_get_channel_arguments(builder);
  bool enable = grpc_channel_arg_get_bool(
      grpc_channel_args_find(channel_args, filtarg->control_channel_arg),
      !grpc_channel_args_want_minimal_stack(channel_args));
  return enable ? grpc_channel_stack_builder_prepend_filter(
                      builder, filtarg->filter, nullptr, nullptr)
                : true;
}

static bool maybe_add_required_filter(grpc_channel_stack_builder* builder,
                                      void* arg) {
  return is_building_http_like_transport(builder)
             ? grpc_channel_stack_builder_prepend_filter(
                   builder, static_cast<const grpc_channel_filter*>(arg),
                   nullptr, nullptr)
             : true;
}

void grpc_http_filters_init(void) {
  grpc_channel_init_register_stage(GRPC_CLIENT_SUBCHANNEL,
                                   GRPC_CHANNEL_INIT_BUILTIN_PRIORITY,
                                   maybe_add_optional_filter, &compress_filter);
  grpc_channel_init_register_stage(GRPC_CLIENT_DIRECT_CHANNEL,
                                   GRPC_CHANNEL_INIT_BUILTIN_PRIORITY,
                                   maybe_add_optional_filter, &compress_filter);
  grpc_channel_init_register_stage(GRPC_SERVER_CHANNEL,
                                   GRPC_CHANNEL_INIT_BUILTIN_PRIORITY,
                                   maybe_add_optional_filter, &compress_filter);
  grpc_channel_init_register_stage(
      GRPC_CLIENT_SUBCHANNEL, GRPC_CHANNEL_INIT_BUILTIN_PRIORITY,
      maybe_add_required_filter, (void*)&grpc_http_client_filter);
  grpc_channel_init_register_stage(
      GRPC_CLIENT_DIRECT_CHANNEL, GRPC_CHANNEL_INIT_BUILTIN_PRIORITY,
      maybe_add_required_filter, (void*)&grpc_http_client_filter);
  grpc_channel_init_register_stage(
      GRPC_SERVER_CHANNEL, GRPC_CHANNEL_INIT_BUILTIN_PRIORITY,
      maybe_add_required_filter, (void*)&grpc_http_server_filter);
}

void grpc_http_filters_shutdown(void) {}
