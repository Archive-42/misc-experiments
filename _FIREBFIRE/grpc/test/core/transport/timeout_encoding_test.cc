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
timeout_encoding.h"

#include <stdio.h>
#include <string.h>

#include <string>

#include "absl/strings/str_format.h"

#include <grpc/support/alloc.h>
#include <grpc/support/log.h>

#include "src/core/lib/gpr/murmur_hash.h"
#include "src/core/lib/gpr/string.h"
#include "src/core/lib/gpr/useful.h"
#include "test/core/util/test_config.h"

#define LOG_TEST(x) gpr_log(GPR_INFO, "%s", x)

static void assert_encodes_as(grpc_millis ts, const char* s) {
  char buffer[GRPC_HTTP2_TIMEOUT_ENCODE_MIN_BUFSIZE];
  grpc_http2_encode_timeout(ts, buffer);
  gpr_log(GPR_INFO, "check '%s' == '%s'", buffer, s);
  GPR_ASSERT(0 == strcmp(buffer, s));
}

void test_encoding(void) {
  LOG_TEST("test_encoding");
  assert_encodes_as(-1, "1n");
  assert_encodes_as(-10, "1n");
  assert_encodes_as(1, "1m");
  assert_encodes_as(10, "10m");
  assert_encodes_as(100, "100m");
  assert_encodes_as(890, "890m");
  assert_encodes_as(900, "900m");
  assert_encodes_as(901, "901m");
  assert_encodes_as(1000, "1S");
  assert_encodes_as(2000, "2S");
  assert_encodes_as(2500, "2500m");
  assert_encodes_as(59900, "59900m");
  assert_encodes_as(50000, "50S");
  assert_encodes_as(59000, "59S");
  assert_encodes_as(60000, "1M");
  assert_encodes_as(80000, "80S");
  assert_encodes_as(90000, "90S");
  assert_encodes_as(120000, "2M");
  assert_encodes_as(20 * 60 * GPR_MS_PER_SEC, "20M");
  assert_encodes_as(60 * 60 * GPR_MS_PER_SEC, "1H");
  assert_encodes_as(10 * 60 * 60 * GPR_MS_PER_SEC, "10H");
  assert_encodes_as(60 * 60 * GPR_MS_PER_SEC - 100, "1H");
  assert_encodes_as(100 * 60 * 60 * GPR_MS_PER_SEC, "100H");
  assert_encodes_as(100000000000, "99999999S");
}

static void assert_decodes_as(const char* buffer, grpc_millis expected) {
  grpc_millis got;
  uint32_t hash = gpr_murmur_hash3(buffer, strlen(buffer), 0);
  gpr_log(GPR_INFO, "check decoding '%s' (hash=0x%x)", buffer, hash);
  GPR_ASSERT(1 == grpc_http2_decode_timeout(
                      grpc_slice_from_static_string(buffer), &got));
  if (got != expected) {
    gpr_log(GPR_ERROR, "got:'%" PRId64 "' != expected:'%" PRId64 "'", got,
            expected);
    abort();
  }
}

void decode_suite(char ext, grpc_millis (*answer)(int64_t x)) {
  long test_vals[] = {1,       12,       123,       1234,     12345,   123456,
                      1234567, 12345678, 123456789, 98765432, 9876543, 987654,
                      98765,   9876,     987,       98,       9};
  for (unsigned i = 0; i < GPR_ARRAY_SIZE(test_vals); i++) {
    std::string input = absl::StrFormat("%ld%c", test_vals[i], ext);
    assert_decodes_as(input.c_str(), answer(test_vals[i]));

    input = absl::StrFormat("   %ld%c", test_vals[i], ext);
    assert_decodes_as(input.c_str(), answer(test_vals[i]));

    input = absl::StrFormat("%ld %c", test_vals[i], ext);
    assert_decodes_as(input.c_str(), answer(test_vals[i]));

    input = absl::StrFormat("%ld %c  ", test_vals[i], ext);
    assert_decodes_as(input.c_str(), answer(test_vals[i]));
  }
}

static grpc_millis millis_from_nanos(int64_t x) {
  return static_cast<grpc_millis>(x / GPR_NS_PER_MS + (x % GPR_NS_PER_MS != 0));
}
static grpc_millis millis_from_micros(int64_t x) {
  return static_cast<grpc_millis>(x / GPR_US_PER_MS + (x % GPR_US_PER_MS != 0));
}
static grpc_millis millis_from_millis(int64_t x) {
  return static_cast<grpc_millis>(x);
}
static grpc_millis millis_from_seconds(int64_t x) {
  return static_cast<grpc_millis>(x * GPR_MS_PER_SEC);
}
static grpc_millis millis_from_minutes(int64_t x) {
  return static_cast<grpc_millis>(x * 60 * GPR_MS_PER_SEC);
}
static grpc_millis millis_from_hours(int64_t x) {
  return static_cast<grpc_millis>(x * 3600 * GPR_MS_PER_SEC);
}

void test_decoding(void) {
  LOG_TEST("test_decoding");
  decode_suite('n', millis_from_nanos);
  decode_suite('u', millis_from_micros);
  decode_suite('m', millis_from_millis);
  decode_suite('S', millis_from_seconds);
  decode_suite('M', millis_from_minutes);
  decode_suite('H', millis_from_hours);
  assert_decodes_as("1000000000S", millis_from_seconds(1000 * 1000 * 1000));
  assert_decodes_as("1000000000000000000000u", GRPC_MILLIS_INF_FUTURE);
  assert_decodes_as("1000000001S", GRPC_MILLIS_INF_FUTURE);
  assert_decodes_as("2000000001S", GRPC_MILLIS_INF_FUTURE);
  assert_decodes_as("9999999999S", GRPC_MILLIS_INF_FUTURE);
}

static void assert_decoding_fails(const char* s) {
  grpc_millis x;
  GPR_ASSERT(0 ==
             grpc_http2_decode_timeout(grpc_slice_from_static_string(s), &x));
}

void test_decoding_fails(void) {
  LOG_TEST("test_decoding_fails");
  assert_decoding_fails("");
  assert_decoding_fails(" ");
  assert_decoding_fails("x");
  assert_decoding_fails("1");
  assert_decoding_fails("1x");
  assert_decoding_fails("1ux");
  assert_decoding_fails("!");
  assert_decoding_fails("n1");
  assert_decoding_fails("-1u");
}

int main(int argc, char** argv) {
  grpc::testing::TestEnvironment env(argc, argv);
  test_encoding();
  test_decoding();
  test_decoding_fails();
  return 0;
}
