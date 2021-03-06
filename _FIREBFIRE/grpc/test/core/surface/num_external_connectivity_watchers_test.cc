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

#include <grpc/grpc_security.h>
#include <grpc/support/alloc.h>
#include <grpc/support/log.h>

#include "src/core/lib/channel/channel_args.h"
#include "src/core/lib/gprpp/host_port.h"
#include "src/core/lib/gprpp/memory.h"
#include "src/core/lib/gprpp/thd.h"
#include "src/core/lib/iomgr/exec_ctx.h"
#include "src/core/lib/iomgr/load_file.h"
#include "test/core/util/port.h"
#include "test/core/util/test_config.h"

#define CA_CERT_PATH "src/core/tsi/test_creds/ca.pem"

typedef struct test_fixture {
  const char* name;
  grpc_channel* (*create_channel)(const char* addr);
} test_fixture;

static size_t next_tag = 1;

static void channel_idle_start_watch(grpc_channel* channel,
                                     grpc_completion_queue* cq) {
  gpr_timespec connect_deadline = grpc_timeout_milliseconds_to_deadline(1);
  GPR_ASSERT(grpc_channel_check_connectivity_state(channel, 0) ==
             GRPC_CHANNEL_IDLE);

  grpc_channel_watch_connectivity_state(
      channel, GRPC_CHANNEL_IDLE, connect_deadline, cq, (void*)(next_tag++));
  gpr_log(GPR_DEBUG, "number of active connect watchers: %d",
          grpc_channel_num_external_connectivity_watchers(channel));
}

static void channel_idle_poll_for_timeout(grpc_channel* channel,
                                          grpc_completion_queue* cq) {
  grpc_event ev = grpc_completion_queue_next(
      cq, gpr_inf_future(GPR_CLOCK_REALTIME), nullptr);

  /* expect watch_connectivity_state to end with a timeout */
  GPR_ASSERT(ev.type == GRPC_OP_COMPLETE);
  GPR_ASSERT(ev.success == false);
  GPR_ASSERT(grpc_channel_check_connectivity_state(channel, 0) ==
             GRPC_CHANNEL_IDLE);
}

/* Test and use the "num_external_watchers" call to make sure
 * that "connectivity watcher" structs are free'd just after, if
 * their corresponding timeouts occur. */
static void run_timeouts_test(const test_fixture* fixture) {
  gpr_log(GPR_INFO, "TEST: %s", fixture->name);

  grpc_init();
  std::string addr =
      grpc_core::JoinHostPort("localhost", grpc_pick_unused_port_or_die());

  grpc_channel* channel = fixture->create_channel(addr.c_str());
  grpc_completion_queue* cq = grpc_completion_queue_create_for_next(nullptr);

  /* start 1 watcher and then let it time out */
  channel_idle_start_watch(channel, cq);
  channel_idle_poll_for_timeout(channel, cq);
  GPR_ASSERT(grpc_channel_num_external_connectivity_watchers(channel) == 0);

  /* start 3 watchers and then let them all time out */
  for (size_t i = 1; i <= 3; i++) {
    channel_idle_start_watch(channel, cq);
  }
  for (size_t i = 1; i <= 3; i++) {
    channel_idle_poll_for_timeout(channel, cq);
  }
  GPR_ASSERT(grpc_channel_num_external_connectivity_watchers(channel) == 0);

  /* start 3 watchers, see one time out, start another 3, and then see them all
   * time out */
  for (size_t i = 1; i <= 3; i++) {
    channel_idle_start_watch(channel, cq);
  }
  channel_idle_poll_for_timeout(channel, cq);
  for (size_t i = 3; i <= 5; i++) {
    channel_idle_start_watch(channel, cq);
  }
  for (size_t i = 1; i <= 5; i++) {
    channel_idle_poll_for_timeout(channel, cq);
  }
  GPR_ASSERT(grpc_channel_num_external_connectivity_watchers(channel) == 0);

  grpc_channel_destroy(channel);
  grpc_completion_queue_shutdown(cq);
  GPR_ASSERT(grpc_completion_queue_next(cq, gpr_inf_future(GPR_CLOCK_REALTIME),
                                        nullptr)
                 .type == GRPC_QUEUE_SHUTDOWN);
  grpc_completion_queue_destroy(cq);

  grpc_shutdown();
}

/* An edge scenario; sets channel state to explicitly, and outside
 * of a polling call. */
static void run_channel_shutdown_before_timeout_test(
    const test_fixture* fixture) {
  gpr_log(GPR_INFO, "TEST: %s", fixture->name);

  grpc_init();
  std::string addr =
      grpc_core::JoinHostPort("localhost", grpc_pick_unused_port_or_die());

  grpc_channel* channel = fixture->create_channel(addr.c_str());
  grpc_completion_queue* cq = grpc_completion_queue_create_for_next(nullptr);

  /* start 1 watcher and then shut down the channel before the timer goes off */
  GPR_ASSERT(grpc_channel_num_external_connectivity_watchers(channel) == 0);

  /* expecting a 30 second timeout to go off much later than the shutdown. */
  gpr_timespec connect_deadline = grpc_timeout_seconds_to_deadline(30);
  GPR_ASSERT(grpc_channel_check_connectivity_state(channel, 0) ==
             GRPC_CHANNEL_IDLE);

  grpc_channel_watch_connectivity_state(channel, GRPC_CHANNEL_IDLE,
                                        connect_deadline, cq, (void*)1);
  grpc_channel_destroy(channel);

  grpc_event ev = grpc_completion_queue_next(
      cq, gpr_inf_future(GPR_CLOCK_REALTIME), nullptr);
  GPR_ASSERT(ev.type == GRPC_OP_COMPLETE);
  /* expect success with a state transition to CHANNEL_SHUTDOWN */
  GPR_ASSERT(ev.success == true);

  grpc_completion_queue_shutdown(cq);
  GPR_ASSERT(grpc_completion_queue_next(cq, gpr_inf_future(GPR_CLOCK_REALTIME),
                                        nullptr)
                 .type == GRPC_QUEUE_SHUTDOWN);
  grpc_completion_queue_destroy(cq);

  grpc_shutdown();
}

static grpc_channel* insecure_test_create_channel(const char* addr) {
  return grpc_insecure_channel_create(addr, nullptr, nullptr);
}

static const test_fixture insecure_test = {
    "insecure",
    insecure_test_create_channel,
};

static grpc_channel* secure_test_create_channel(const char* addr) {
  grpc_slice ca_slice;
  GPR_ASSERT(GRPC_LOG_IF_ERROR("load_file",
                               grpc_load_file(CA_CERT_PATH, 1, &ca_slice)));
  const char* test_root_cert =
      reinterpret_cast<const char*> GRPC_SLICE_START_PTR(ca_slice);
  grpc_channel_credentials* ssl_creds =
      grpc_ssl_credentials_create(test_root_cert, nullptr, nullptr, nullptr);
  grpc_slice_unref(ca_slice);
  grpc_arg ssl_name_override = {
      GRPC_ARG_STRING,
      const_cast<char*>(GRPC_SSL_TARGET_NAME_OVERRIDE_ARG),
      {const_cast<char*>("foo.test.google.fr")}};
  grpc_channel_args* new_client_args =
      grpc_channel_args_copy_and_add(nullptr, &ssl_name_override, 1);
  grpc_channel* channel =
      grpc_secure_channel_create(ssl_creds, addr, new_client_args, nullptr);
  {
    grpc_core::ExecCtx exec_ctx;
    grpc_channel_args_destroy(new_client_args);
  }
  grpc_channel_credentials_release(ssl_creds);
  return channel;
}

static const test_fixture secure_test = {
    "secure",
    secure_test_create_channel,
};

int main(int argc, char** argv) {
  grpc::testing::TestEnvironment env(argc, argv);

  run_timeouts_test(&insecure_test);
  run_timeouts_test(&secure_test);

  run_channel_shutdown_before_timeout_test(&insecure_test);
  run_channel_shutdown_before_timeout_test(&secure_test);
}
