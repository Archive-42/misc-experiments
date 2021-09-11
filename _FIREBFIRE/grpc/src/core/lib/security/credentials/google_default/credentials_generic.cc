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
orm.h>

#include "src/core/lib/security/credentials/google_default/google_default_credentials.h"

#include <string>

#include "absl/strings/str_cat.h"

#include <grpc/support/alloc.h>
#include <grpc/support/log.h>

#include "src/core/lib/gpr/env.h"

std::string grpc_get_well_known_google_credentials_file_path_impl(void) {
  char* base = gpr_getenv(GRPC_GOOGLE_CREDENTIALS_PATH_ENV_VAR);
  if (base == nullptr) {
    gpr_log(GPR_ERROR, "Could not get " GRPC_GOOGLE_CREDENTIALS_PATH_ENV_VAR
                       " environment variable.");
    return "";
  }
  std::string result =
      absl::StrCat(base, "/", GRPC_GOOGLE_CREDENTIALS_PATH_SUFFIX);
  gpr_free(base);
  return result;
}
