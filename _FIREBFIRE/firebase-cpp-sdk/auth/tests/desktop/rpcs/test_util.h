/*
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
OP_RPCS_TEST_UTIL_H_

#include <string>

namespace firebase {
namespace auth {

// Sign in a new user and return its local ID and ID token.
bool GetNewUserLocalIdAndIdToken(const char* api_key, std::string* local_id,
                                 std::string* id_token);

// Sign in a new user and return its local ID and refresh token.
bool GetNewUserLocalIdAndRefreshToken(const char* api_key,
                                      std::string* local_id,
                                      std::string* refresh_token);
std::string SignUpNewUserAndGetIdToken(const char* api_key, const char* email);

}  // namespace auth
}  // namespace firebase

#endif  // FIREBASE_AUTH_TESTS_DESKTOP_RPCS_TEST_UTIL_H_
