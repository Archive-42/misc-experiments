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
nd_tests.h"

#include <grpc/grpc_security.h>

#include "src/core/lib/surface/channel.h"

struct grpc_end2end_local_fullstack_fixture_data {
  grpc_core::UniquePtr<char> localaddr;
};

/* Utility functions shared by h2_local tests. */
grpc_end2end_test_fixture grpc_end2end_local_chttp2_create_fixture_fullstack();

void grpc_end2end_local_chttp2_init_client_fullstack(
    grpc_end2end_test_fixture* f, grpc_channel_args* client_args,
    grpc_local_connect_type type);

void grpc_end2end_local_chttp2_init_server_fullstack(
    grpc_end2end_test_fixture* f, grpc_channel_args* server_args,
    grpc_local_connect_type type);

void grpc_end2end_local_chttp2_tear_down_fullstack(
    grpc_end2end_test_fixture* f);
