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
orm.h>

#include <grpc/support/alloc.h>
#include "src/core/lib/iomgr/resolve_address.h"

grpc_address_resolver_vtable* grpc_resolve_address_impl;

void grpc_set_resolver_impl(grpc_address_resolver_vtable* vtable) {
  grpc_resolve_address_impl = vtable;
}

void grpc_resolve_address(const char* addr, const char* default_port,
                          grpc_pollset_set* interested_parties,
                          grpc_closure* on_done,
                          grpc_resolved_addresses** addresses) {
  grpc_resolve_address_impl->resolve_address(
      addr, default_port, interested_parties, on_done, addresses);
}

void grpc_resolved_addresses_destroy(grpc_resolved_addresses* addrs) {
  if (addrs != nullptr) {
    gpr_free(addrs->addrs);
  }
  gpr_free(addrs);
}

grpc_error* grpc_blocking_resolve_address(const char* name,
                                          const char* default_port,
                                          grpc_resolved_addresses** addresses) {
  return grpc_resolve_address_impl->blocking_resolve_address(name, default_port,
                                                             addresses);
}
