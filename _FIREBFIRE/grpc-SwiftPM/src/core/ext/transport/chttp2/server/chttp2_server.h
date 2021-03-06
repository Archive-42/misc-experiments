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
HTTP2_SERVER_CHTTP2_SERVER_H
#define GRPC_CORE_EXT_TRANSPORT_CHTTP2_SERVER_CHTTP2_SERVER_H

#include <grpc/support/port_platform.h>

#include <grpc/impl/codegen/grpc_types.h>

#include "src/core/lib/iomgr/error.h"

/// Adds a port to \a server.  Sets \a port_num to the port number.
/// Takes ownership of \a args.
grpc_error* grpc_chttp2_server_add_port(grpc_server* server, const char* addr,
                                        grpc_channel_args* args, int* port_num);

#endif /* GRPC_CORE_EXT_TRANSPORT_CHTTP2_SERVER_CHTTP2_SERVER_H */
