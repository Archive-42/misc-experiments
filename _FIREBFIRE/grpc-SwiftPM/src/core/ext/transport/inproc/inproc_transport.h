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
NPROC_INPROC_TRANSPORT_H
#define GRPC_CORE_EXT_TRANSPORT_INPROC_INPROC_TRANSPORT_H

#include <grpc/support/port_platform.h>

#include "src/core/lib/transport/transport_impl.h"

grpc_channel* grpc_inproc_channel_create(grpc_server* server,
                                         grpc_channel_args* args,
                                         void* reserved);

extern grpc_core::TraceFlag grpc_inproc_trace;

void grpc_inproc_transport_init(void);
void grpc_inproc_transport_shutdown(void);

#endif /* GRPC_CORE_EXT_TRANSPORT_INPROC_INPROC_TRANSPORT_H */
