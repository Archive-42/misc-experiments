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
h"

#include <string.h>

#include <grpc/grpc.h>
#include <grpc/slice.h>
#include <grpc/support/alloc.h>
#include <grpc/support/log.h>
#include "src/core/lib/iomgr/exec_ctx.h"
#include "src/core/lib/slice/slice_internal.h"
#include "test/core/util/test_config.h"

static int buffers_are_equal(const unsigned char* buf1,
                             const unsigned char* buf2, size_t size) {
  size_t i;
  for (i = 0; i < size; i++) {
    if (buf1[i] != buf2[i]) {
      gpr_log(GPR_ERROR, "buf1 and buf2 differ: buf1[%d] = %x vs buf2[%d] = %x",
              static_cast<int>(i), buf1[i], static_cast<int>(i), buf2[i]);
      return 0;
    }
  }
  return 1;
}

static void test_simple_encode_decode_b64(int url_safe, int multiline) {
  const char* hello = "hello";
  char* hello_b64 =
      grpc_base64_encode(hello, strlen(hello), url_safe, multiline);
  grpc_core::ExecCtx exec_ctx;
  grpc_slice hello_slice = grpc_base64_decode(hello_b64, url_safe);
  GPR_ASSERT(GRPC_SLICE_LENGTH(hello_slice) == strlen(hello));
  GPR_ASSERT(strncmp((const char*)GRPC_SLICE_START_PTR(hello_slice), hello,
                     GRPC_SLICE_LENGTH(hello_slice)) == 0);

  grpc_slice_unref_internal(hello_slice);

  gpr_free(hello_b64);
}

static void test_full_range_encode_decode_b64(int url_safe, int multiline) {
  unsigned char orig[256];
  size_t i;
  char* b64;
  grpc_slice orig_decoded;
  for (i = 0; i < sizeof(orig); i++) orig[i] = static_cast<uint8_t>(i);

  /* Try all the different paddings. */
  for (i = 0; i < 3; i++) {
    grpc_core::ExecCtx exec_ctx;
    b64 = grpc_base64_encode(orig, sizeof(orig) - i, url_safe, multiline);
    orig_decoded = grpc_base64_decode(b64, url_safe);
    GPR_ASSERT(GRPC_SLICE_LENGTH(orig_decoded) == (sizeof(orig) - i));
    GPR_ASSERT(buffers_are_equal(orig, GRPC_SLICE_START_PTR(orig_decoded),
                                 sizeof(orig) - i));
    grpc_slice_unref_internal(orig_decoded);
    gpr_free(b64);
  }
}

static void test_simple_encode_decode_b64_no_multiline(void) {
  test_simple_encode_decode_b64(0, 0);
}

static void test_simple_encode_decode_b64_multiline(void) {
  test_simple_encode_decode_b64(0, 1);
}

static void test_simple_encode_decode_b64_urlsafe_no_multiline(void) {
  test_simple_encode_decode_b64(1, 0);
}

static void test_simple_encode_decode_b64_urlsafe_multiline(void) {
  test_simple_encode_decode_b64(1, 1);
}

static void test_full_range_encode_decode_b64_no_multiline(void) {
  test_full_range_encode_decode_b64(0, 0);
}

static void test_full_range_encode_decode_b64_multiline(void) {
  test_full_range_encode_decode_b64(0, 1);
}

static void test_full_range_encode_decode_b64_urlsafe_no_multiline(void) {
  test_full_range_encode_decode_b64(1, 0);
}

static void test_full_range_encode_decode_b64_urlsafe_multiline(void) {
  test_full_range_encode_decode_b64(1, 1);
}

static void test_url_safe_unsafe_mismatch_failure(void) {
  unsigned char orig[256];
  size_t i;
  char* b64;
  grpc_slice orig_decoded;
  int url_safe = 1;
  for (i = 0; i < sizeof(orig); i++) orig[i] = static_cast<uint8_t>(i);

  grpc_core::ExecCtx exec_ctx;
  b64 = grpc_base64_encode(orig, sizeof(orig), url_safe, 0);
  orig_decoded = grpc_base64_decode(b64, !url_safe);
  GPR_ASSERT(GRPC_SLICE_IS_EMPTY(orig_decoded));
  gpr_free(b64);
  grpc_slice_unref_internal(orig_decoded);

  b64 = grpc_base64_encode(orig, sizeof(orig), !url_safe, 0);
  orig_decoded = grpc_base64_decode(b64, url_safe);
  GPR_ASSERT(GRPC_SLICE_IS_EMPTY(orig_decoded));
  gpr_free(b64);
  grpc_slice_unref_internal(orig_decoded);
}

static void test_rfc4648_test_vectors(void) {
  char* b64;

  b64 = grpc_base64_encode("", 0, 0, 0);
  GPR_ASSERT(strcmp("", b64) == 0);
  gpr_free(b64);

  b64 = grpc_base64_encode("f", 1, 0, 0);
  GPR_ASSERT(strcmp("Zg==", b64) == 0);
  gpr_free(b64);

  b64 = grpc_base64_encode("fo", 2, 0, 0);
  GPR_ASSERT(strcmp("Zm8=", b64) == 0);
  gpr_free(b64);

  b64 = grpc_base64_encode("foo", 3, 0, 0);
  GPR_ASSERT(strcmp("Zm9v", b64) == 0);
  gpr_free(b64);

  b64 = grpc_base64_encode("foob", 4, 0, 0);
  GPR_ASSERT(strcmp("Zm9vYg==", b64) == 0);
  gpr_free(b64);

  b64 = grpc_base64_encode("fooba", 5, 0, 0);
  GPR_ASSERT(strcmp("Zm9vYmE=", b64) == 0);
  gpr_free(b64);

  b64 = grpc_base64_encode("foobar", 6, 0, 0);
  GPR_ASSERT(strcmp("Zm9vYmFy", b64) == 0);
  gpr_free(b64);
}

static void test_unpadded_decode(void) {
  grpc_slice decoded;

  grpc_core::ExecCtx exec_ctx;
  decoded = grpc_base64_decode("Zm9vYmFy", 0);
  GPR_ASSERT(!GRPC_SLICE_IS_EMPTY(decoded));
  GPR_ASSERT(grpc_slice_str_cmp(decoded, "foobar") == 0);
  grpc_slice_unref(decoded);

  decoded = grpc_base64_decode("Zm9vYmE", 0);
  GPR_ASSERT(!GRPC_SLICE_IS_EMPTY(decoded));
  GPR_ASSERT(grpc_slice_str_cmp(decoded, "fooba") == 0);
  grpc_slice_unref(decoded);

  decoded = grpc_base64_decode("Zm9vYg", 0);
  GPR_ASSERT(!GRPC_SLICE_IS_EMPTY(decoded));
  GPR_ASSERT(grpc_slice_str_cmp(decoded, "foob") == 0);
  grpc_slice_unref(decoded);

  decoded = grpc_base64_decode("Zm9v", 0);
  GPR_ASSERT(!GRPC_SLICE_IS_EMPTY(decoded));
  GPR_ASSERT(grpc_slice_str_cmp(decoded, "foo") == 0);
  grpc_slice_unref(decoded);

  decoded = grpc_base64_decode("Zm8", 0);
  GPR_ASSERT(!GRPC_SLICE_IS_EMPTY(decoded));
  GPR_ASSERT(grpc_slice_str_cmp(decoded, "fo") == 0);
  grpc_slice_unref(decoded);

  decoded = grpc_base64_decode("Zg", 0);
  GPR_ASSERT(!GRPC_SLICE_IS_EMPTY(decoded));
  GPR_ASSERT(grpc_slice_str_cmp(decoded, "f") == 0);
  grpc_slice_unref(decoded);

  decoded = grpc_base64_decode("", 0);
  GPR_ASSERT(GRPC_SLICE_IS_EMPTY(decoded));
}

int main(int argc, char** argv) {
  grpc::testing::TestEnvironment env(argc, argv);
  grpc_init();
  test_simple_encode_decode_b64_no_multiline();
  test_simple_encode_decode_b64_multiline();
  test_simple_encode_decode_b64_urlsafe_no_multiline();
  test_simple_encode_decode_b64_urlsafe_multiline();
  test_full_range_encode_decode_b64_no_multiline();
  test_full_range_encode_decode_b64_multiline();
  test_full_range_encode_decode_b64_urlsafe_no_multiline();
  test_full_range_encode_decode_b64_urlsafe_multiline();
  test_url_safe_unsafe_mismatch_failure();
  test_rfc4648_test_vectors();
  test_unpadded_decode();
  grpc_shutdown();
  return 0;
}
