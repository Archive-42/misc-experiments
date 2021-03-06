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

#include "src/core/ext/filters/client_channel/lb_policy/grpclb/client_load_reporting_filter.h"

#include <string.h>

#include <grpc/support/atm.h>
#include <grpc/support/log.h>

#include "src/core/ext/filters/client_channel/lb_policy/grpclb/grpclb.h"
#include "src/core/ext/filters/client_channel/lb_policy/grpclb/grpclb_client_stats.h"
#include "src/core/lib/iomgr/error.h"
#include "src/core/lib/profiling/timers.h"

static grpc_error* clr_init_channel_elem(grpc_channel_element* /*elem*/,
                                         grpc_channel_element_args* /*args*/) {
  return GRPC_ERROR_NONE;
}

static void clr_destroy_channel_elem(grpc_channel_element* /*elem*/) {}

namespace {

struct call_data {
  // Stats object to update.
  grpc_core::RefCountedPtr<grpc_core::GrpcLbClientStats> client_stats;
  // State for intercepting send_initial_metadata.
  grpc_closure on_complete_for_send;
  grpc_closure* original_on_complete_for_send;
  bool send_initial_metadata_succeeded = false;
  // State for intercepting recv_initial_metadata.
  grpc_closure recv_initial_metadata_ready;
  grpc_closure* original_recv_initial_metadata_ready;
  bool recv_initial_metadata_succeeded = false;
};

}  // namespace

static void on_complete_for_send(void* arg, grpc_error* error) {
  call_data* calld = static_cast<call_data*>(arg);
  if (error == GRPC_ERROR_NONE) {
    calld->send_initial_metadata_succeeded = true;
  }
  grpc_core::Closure::Run(DEBUG_LOCATION, calld->original_on_complete_for_send,
                          GRPC_ERROR_REF(error));
}

static void recv_initial_metadata_ready(void* arg, grpc_error* error) {
  call_data* calld = static_cast<call_data*>(arg);
  if (error == GRPC_ERROR_NONE) {
    calld->recv_initial_metadata_succeeded = true;
  }
  grpc_core::Closure::Run(DEBUG_LOCATION,
                          calld->original_recv_initial_metadata_ready,
                          GRPC_ERROR_REF(error));
}

static grpc_error* clr_init_call_elem(grpc_call_element* elem,
                                      const grpc_call_element_args* args) {
  GPR_ASSERT(args->context != nullptr);
  new (elem->call_data) call_data();
  return GRPC_ERROR_NONE;
}

static void clr_destroy_call_elem(grpc_call_element* elem,
                                  const grpc_call_final_info* /*final_info*/,
                                  grpc_closure* /*ignored*/) {
  call_data* calld = static_cast<call_data*>(elem->call_data);
  if (calld->client_stats != nullptr) {
    // Record call finished, optionally setting client_failed_to_send and
    // received.
    calld->client_stats->AddCallFinished(
        !calld->send_initial_metadata_succeeded /* client_failed_to_send */,
        calld->recv_initial_metadata_succeeded /* known_received */);
  }
  calld->~call_data();
}

static void clr_start_transport_stream_op_batch(
    grpc_call_element* elem, grpc_transport_stream_op_batch* batch) {
  call_data* calld = static_cast<call_data*>(elem->call_data);
  GPR_TIMER_SCOPE("clr_start_transport_stream_op_batch", 0);
  // Handle send_initial_metadata.
  if (batch->send_initial_metadata) {
    // Grab client stats object from metadata.
    grpc_linked_mdelem* client_stats_md =
        batch->payload->send_initial_metadata.send_initial_metadata->list.head;
    for (; client_stats_md != nullptr;
         client_stats_md = client_stats_md->next) {
      if (GRPC_SLICE_START_PTR(GRPC_MDKEY(client_stats_md->md)) ==
          static_cast<const void*>(grpc_core::kGrpcLbClientStatsMetadataKey)) {
        break;
      }
    }
    if (client_stats_md != nullptr) {
      grpc_core::GrpcLbClientStats* client_stats =
          const_cast<grpc_core::GrpcLbClientStats*>(
              reinterpret_cast<const grpc_core::GrpcLbClientStats*>(
                  GRPC_SLICE_START_PTR(GRPC_MDVALUE(client_stats_md->md))));
      if (client_stats != nullptr) {
        calld->client_stats.reset(client_stats);
        // Intercept completion.
        calld->original_on_complete_for_send = batch->on_complete;
        GRPC_CLOSURE_INIT(&calld->on_complete_for_send, on_complete_for_send,
                          calld, grpc_schedule_on_exec_ctx);
        batch->on_complete = &calld->on_complete_for_send;
      }
      // Remove metadata so it doesn't go out on the wire.
      grpc_metadata_batch_remove(
          batch->payload->send_initial_metadata.send_initial_metadata,
          client_stats_md);
    }
  }
  // Intercept completion of recv_initial_metadata.
  if (batch->recv_initial_metadata) {
    calld->original_recv_initial_metadata_ready =
        batch->payload->recv_initial_metadata.recv_initial_metadata_ready;
    GRPC_CLOSURE_INIT(&calld->recv_initial_metadata_ready,
                      recv_initial_metadata_ready, calld,
                      grpc_schedule_on_exec_ctx);
    batch->payload->recv_initial_metadata.recv_initial_metadata_ready =
        &calld->recv_initial_metadata_ready;
  }
  // Chain to next filter.
  grpc_call_next_op(elem, batch);
}

const grpc_channel_filter grpc_client_load_reporting_filter = {
    clr_start_transport_stream_op_batch,
    grpc_channel_next_op,
    sizeof(call_data),
    clr_init_call_elem,
    grpc_call_stack_ignore_set_pollset_or_pollset_set,
    clr_destroy_call_elem,
    0,  // sizeof(channel_data)
    clr_init_channel_elem,
    clr_destroy_channel_elem,
    grpc_channel_next_get_info,
    "client_load_reporting"};
