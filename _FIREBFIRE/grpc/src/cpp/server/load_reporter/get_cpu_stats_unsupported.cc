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

#if !defined(GPR_LINUX) && !defined(GPR_WINDOWS) && !defined(GPR_APPLE)

#include <grpc/support/log.h>

#include "src/cpp/server/load_reporter/get_cpu_stats.h"

namespace grpc {
namespace load_reporter {

std::pair<uint64_t, uint64_t> GetCpuStatsImpl() {
  uint64_t busy = 0, total = 0;
  gpr_log(GPR_ERROR,
          "Platforms other than Linux, Windows, and MacOS are not supported.");
  return std::make_pair(busy, total);
}

}  // namespace load_reporter
}  // namespace grpc

#endif  // !defined(GPR_LINUX) && !defined(GPR_WINDOWS) && !defined(GPR_APPLE)
