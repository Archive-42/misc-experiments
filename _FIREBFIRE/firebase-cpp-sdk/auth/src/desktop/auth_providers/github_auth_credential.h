/*
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
_AUTH_PROVIDERS_GITHUB_AUTH_CREDENTIAL_H_

#include "auth/src/desktop/auth_constants.h"
#include "auth/src/desktop/identity_provider_credential.h"
#include "auth/src/desktop/rpcs/verify_assertion_request.h"

namespace firebase {
namespace auth {

class GitHubAuthProvider;

class GitHubAuthCredential : public IdentityProviderCredential {
 public:
  std::string GetProvider() const override { return kGitHubAuthProviderId; }

  std::unique_ptr<VerifyAssertionRequest> CreateVerifyAssertionRequest(
      const char* const api_key) const override {
    return VerifyAssertionRequest::FromAccessToken(
        api_key, GetProvider().c_str(), token_.c_str());
  }

 private:
  explicit GitHubAuthCredential(const std::string& token) : token_(token) {}

  const std::string token_;

  friend class GitHubAuthProvider;
};

}  // namespace auth
}  // namespace firebase

#endif  // FIREBASE_AUTH_SRC_DESKTOP_AUTH_PROVIDERS_GITHUB_AUTH_CREDENTIAL_H_
