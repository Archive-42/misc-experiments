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
H_
#define GRPC_RB_COMPLETION_QUEUE_H_

#include <ruby/ruby.h>

#include <grpc/grpc.h>

void grpc_rb_completion_queue_destroy(grpc_completion_queue* cq);

/**
 * Makes the implementation of CompletionQueue#pluck available in other files
 *
 * This avoids having code that holds the GIL repeated at multiple sites.
 */
grpc_event rb_completion_queue_pluck(grpc_completion_queue* queue, void* tag,
                                     gpr_timespec deadline, void* reserved);

#endif /* GRPC_RB_COMPLETION_QUEUE_H_ */
