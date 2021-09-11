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

import XCTest
import FirebaseAnalytics
#if canImport(SwiftUI)
  import SwiftUI
  import FirebaseAnalyticsSwift
#endif

class importTest: XCTestCase {
  func testAnalyticsImported() {
    Analytics.logEvent(AnalyticsEventEcommercePurchase,
                       parameters: [AnalyticsParameterShipping: 10.0])
  }

  @available(iOS 13, *)
  @available(tvOS, unavailable)
  @available(macOS, unavailable)
  @available(macCatalyst, unavailable)
  @available(watchOS, unavailable)
  func testAnalyticsSwiftImported() {
    _ = Text("Hello, Analytics")
      .analyticsScreen(name: "analytics_text",
                       class: "Greeting",
                       extraParameters: ["greeted": true])
  }
}
