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

#define _GNU_SOURCE
#endif /* _GNU_SOURCE */

#include <grpc/support/port_platform.h>

#ifdef GPR_CPU_LINUX

#include <errno.h>
#include <sched.h>
#include <string.h>
#include <unistd.h>

#include <grpc/support/cpu.h>
#include <grpc/support/log.h>
#include <grpc/support/sync.h>

static int ncpus = 0;

static void init_num_cpus() {
#ifndef GPR_MUSL_LIBC_COMPAT
  if (sched_getcpu() < 0) {
    gpr_log(GPR_ERROR, "Error determining current CPU: %s\n", strerror(errno));
    ncpus = 1;
    return;
  }
#endif
  /* This must be signed. sysconf returns -1 when the number cannot be
     determined */
  ncpus = static_cast<int>(sysconf(_SC_NPROCESSORS_CONF));
  if (ncpus < 1) {
    gpr_log(GPR_ERROR, "Cannot determine number of CPUs: assuming 1");
    ncpus = 1;
  }
}

unsigned gpr_cpu_num_cores(void) {
  static gpr_once once = GPR_ONCE_INIT;
  gpr_once_init(&once, init_num_cpus);
  return static_cast<unsigned>(ncpus);
}

unsigned gpr_cpu_current_cpu(void) {
#ifdef GPR_MUSL_LIBC_COMPAT
  // sched_getcpu() is undefined on musl
  return 0;
#else
  if (gpr_cpu_num_cores() == 1) {
    return 0;
  }
  int cpu = sched_getcpu();
  if (cpu < 0) {
    gpr_log(GPR_ERROR, "Error determining current CPU: %s\n", strerror(errno));
    return 0;
  }
  if (static_cast<unsigned>(cpu) >= gpr_cpu_num_cores()) {
    gpr_log(GPR_DEBUG, "Cannot handle hot-plugged CPUs");
    return 0;
  }
  return static_cast<unsigned>(cpu);
#endif
}

#endif /* GPR_CPU_LINUX */
