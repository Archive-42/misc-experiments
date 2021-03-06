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
BY_GENERATOR_HELPERS_INL_H
#define GRPC_INTERNAL_COMPILER_RUBY_GENERATOR_HELPERS_INL_H

#include "src/compiler/config.h"
#include "src/compiler/generator_helpers.h"
#include "src/compiler/ruby_generator_string-inl.h"

namespace grpc_ruby_generator {

inline bool ServicesFilename(const grpc::protobuf::FileDescriptor* file,
                             std::string* file_name_or_error) {
  // Get output file name.
  static const unsigned proto_suffix_length = 6;  // length of ".proto"
  if (file->name().size() > proto_suffix_length &&
      file->name().find_last_of(".proto") == file->name().size() - 1) {
    *file_name_or_error =
        file->name().substr(0, file->name().size() - proto_suffix_length) +
        "_services_pb.rb";
    return true;
  } else {
    *file_name_or_error = "Invalid proto file name:  must end with .proto";
    return false;
  }
}

inline std::string MessagesRequireName(
    const grpc::protobuf::FileDescriptor* file) {
  return Replace(file->name(), ".proto", "_pb");
}

// Get leading or trailing comments in a string. Comment lines start with "# ".
// Leading detached comments are put in front of leading comments.
template <typename DescriptorType>
inline std::string GetRubyComments(const DescriptorType* desc, bool leading) {
  return grpc_generator::GetPrefixedComments(desc, leading, "#");
}

}  // namespace grpc_ruby_generator

#endif  // GRPC_INTERNAL_COMPILER_RUBY_GENERATOR_HELPERS_INL_H
