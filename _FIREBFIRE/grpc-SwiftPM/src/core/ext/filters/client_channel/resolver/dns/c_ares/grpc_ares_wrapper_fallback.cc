/*
 *
 * Copyright 2016-2017 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
orm.h>

#if GRPC_ARES != 1

#include "src/core/ext/filters/client_channel/resolver/dns/c_ares/grpc_ares_wrapper.h"

struct grpc_ares_request {
  char val;
};

static grpc_ares_request* grpc_dns_lookup_ares_locked_impl(
    const char* dns_server, const char* name, const char* default_port,
    grpc_pollset_set* interested_parties, grpc_closure* on_done,
    std::unique_ptr<grpc_core::ServerAddressList>* addrs, bool check_grpclb,
    char** service_config_json, int query_timeout_ms,
    grpc_core::Combiner* combiner) {
  return NULL;
}

grpc_ares_request* (*grpc_dns_lookup_ares_locked)(
    const char* dns_server, const char* name, const char* default_port,
    grpc_pollset_set* interested_parties, grpc_closure* on_done,
    std::unique_ptr<grpc_core::ServerAddressList>* addrs, bool check_grpclb,
    char** service_config_json, int query_timeout_ms,
    grpc_core::Combiner* combiner) = grpc_dns_lookup_ares_locked_impl;

static void grpc_cancel_ares_request_locked_impl(grpc_ares_request* r) {}

void (*grpc_cancel_ares_request_locked)(grpc_ares_request* r) =
    grpc_cancel_ares_request_locked_impl;

grpc_error* grpc_ares_init(void) { return GRPC_ERROR_NONE; }

void grpc_ares_cleanup(void) {}

static void grpc_resolve_address_ares_impl(const char* name,
                                           const char* default_port,
                                           grpc_pollset_set* interested_parties,
                                           grpc_closure* on_done,
                                           grpc_resolved_addresses** addrs) {}

void (*grpc_resolve_address_ares)(
    const char* name, const char* default_port,
    grpc_pollset_set* interested_parties, grpc_closure* on_done,
    grpc_resolved_addresses** addrs) = grpc_resolve_address_ares_impl;

#endif /* GRPC_ARES != 1 */
