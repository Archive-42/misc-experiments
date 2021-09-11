/*
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import XCTest
import FirebaseAuth

class AccountInfoTests: TestsBase {
  /** The testing email address for testCreateAccountWithEmailAndPassword. */
  let kOldUserEmail = "user+user_old_email@example.com"

  /** The testing email address for testUpdatingUsersEmail. */
  let kNewUserEmail = "user+user_new_email@example.com"

  override func setUp() {
    let auth = Auth.auth()
    let expectation1 = self.expectation(description: "Created account with email and password.")
    auth.createUser(withEmail: kOldUserEmail, password: "password") { user, error in
      // Succeed whether or not the user already exists.
      expectation1.fulfill()
    }
    waitForExpectations(timeout:TestsBase.kExpectationsTimeout)
  }

  override func tearDown() {
    // Clean up the created Firebase user for future runs.
    self.deleteCurrentUser()
  }

  func testUpdatingUsersEmail() {
    let auth = Auth.auth()
    let expectation1 = self.expectation(description: "Created account with email and password.")
    auth.createUser(withEmail: kOldUserEmail, password: "password") { user, error in
      if let error = error  {
        XCTAssertEqual((error as NSError).code,
                     AuthErrorCode.emailAlreadyInUse.rawValue,
                     "Created a user despite it already exiting.")
      } else {
        XCTAssertTrue(false, "Did not get error for recreating a user")
      }
      expectation1.fulfill()
    }
    waitForExpectations(timeout:TestsBase.kExpectationsTimeout)

    let expectation2 = self.expectation(description: "Sign in with email and password.")
    auth.signIn(withEmail: kOldUserEmail, password: "password") { user, error in
      XCTAssertNil(error)
      XCTAssertEqual(auth.currentUser?.email,
                     self.kOldUserEmail,
                     "Signed user does not match request.")
      expectation2.fulfill()
    }
    waitForExpectations(timeout:TestsBase.kExpectationsTimeout)

    let expectation3 = self.expectation(description: "Update email address.")
    auth.currentUser?.updateEmail(to: kNewUserEmail) { error in
      XCTAssertNil(error)
      XCTAssertEqual(auth.currentUser?.email,
                     self.kNewUserEmail,
                     "Signed user does not match change.")
      expectation3.fulfill()
    }
    waitForExpectations(timeout:TestsBase.kExpectationsTimeout)
  }
}
