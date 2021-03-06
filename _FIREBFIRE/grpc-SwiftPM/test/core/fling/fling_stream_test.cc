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

#include <string.h>

#include <grpc/support/alloc.h>
#include <grpc/support/string_util.h>

#include "src/core/lib/gpr/string.h"
#include "src/core/lib/gprpp/host_port.h"
#include "test/core/util/port.h"
#include "test/core/util/subprocess.h"

int main(int /*argc*/, char** argv) {
  char* me = argv[0];
  char* lslash = strrchr(me, '/');
  char root[1024];
  int port = grpc_pick_unused_port_or_die();
  char* args[10];
  int status;
  gpr_subprocess *svr, *cli;
  /* figure out where we are */
  if (lslash) {
    memcpy(root, me, static_cast<size_t>(lslash - me));
    root[lslash - me] = 0;
  } else {
    strcpy(root, ".");
  }
  /* start the server */
  gpr_asprintf(&args[0], "%s/fling_server%s", root,
               gpr_subprocess_binary_extension());
  args[1] = const_cast<char*>("--bind");
  grpc_core::UniquePtr<char> joined;
  grpc_core::JoinHostPort(&joined, "::", port);
  args[2] = joined.get();
  args[3] = const_cast<char*>("--no-secure");
  svr = gpr_subprocess_create(4, (const char**)args);
  gpr_free(args[0]);

  /* start the client */
  gpr_asprintf(&args[0], "%s/fling_client%s", root,
               gpr_subprocess_binary_extension());
  args[1] = const_cast<char*>("--target");
  grpc_core::JoinHostPort(&joined, "127.0.0.1", port);
  args[2] = joined.get();
  args[3] = const_cast<char*>("--scenario=ping-pong-stream");
  args[4] = const_cast<char*>("--no-secure");
  args[5] = nullptr;
  cli = gpr_subprocess_create(6, (const char**)args);
  gpr_free(args[0]);

  /* wait for completion */
  printf("waiting for client\n");
  if ((status = gpr_subprocess_join(cli))) {
    gpr_subprocess_destroy(cli);
    gpr_subprocess_destroy(svr);
    return status;
  }
  gpr_subprocess_destroy(cli);

  gpr_subprocess_interrupt(svr);
  status = gpr_subprocess_join(svr);
  gpr_subprocess_destroy(svr);
  return status;
}
