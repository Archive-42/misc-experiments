// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import SwiftUI
import FirebaseMessaging
import FirebaseInstallations

public final class Identity: ObservableObject {
  // Identity that is unique per app.
  @Published public var installationsID: String? = nil
  // The token that Firebase Messaging use to send notifications.
  @Published public var token: String? = nil

  init() {
    Installations.installations().installationID(completion: { fid, error in
      if let error = error as NSError? {
        print("Failed to get FID: ", error)
        return
      }
      self.installationsID = fid
    })
  }
}
