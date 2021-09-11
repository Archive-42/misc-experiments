# Firebase Apple SDK Roadmap

## Contributing

This is a longer roadmap than we can implement internally and we very
much welcome community contributions.

See the information about Development setup [here](README.md#Development) and
[Contributing](CONTRIBUTING.md) for more information on the mechanics of
contributing to the Firebase iOS SDK.

## Modernization - More Swifty

### APIs

Continue to evolve the Firebase API surface to be more
Swift-friendly. This is generally done with Swift specific extension libraries.

[FirebaseStorageSwift](FirebaseStorageSwift) is an example that extends
FirebaseStorage with APIs that take advantage of Swift's Result type.
[FirebaseFirestoreSwift](Firestore/Swift) is a larger library that adds
Codable support for Firestore.

Add more such APIs to improve the Firebase Swift API.

More details in the
[project](https://github.com/firebase/firebase-ios-sdk/projects/2).

### Combine

Add combine support for Firebase. See the
[Tracking Issue](https://github.com/firebase/firebase-ios-sdk/issues/7295) and
[Project](https://github.com/firebase/firebase-ios-sdk/projects/3).

### SwiftUI

Firebase should be better integrated with SwiftUI apps. See SwiftUI related
[issues](https://github.com/firebase/firebase-ios-sdk/issues?q=is%3Aissue+is%3Aopen++label%3ASwiftUI).

### Swift Async/Await

Evaluate impact on Firebase APIs of the
[Swift Async/await proposal](https://github.com/apple/swift-evolution/blob/main/proposals/0296-async-await.md)

## More complete Apple platform support

Continue to expand the range and quality of Firebase support across
all Apple platforms.

Expand the
[current non-iOS platform support](README.md#community-supported-efforts)
from community supported to officially supported.

Fill in the missing pieces of the support matrix, which is
primarily *watchOS* for several libraries.

## Getting Started

### Quickstarts

Modernize the [Swift Quickstarts](https://github.com/firebase/quickstart-ios).
Continue the work done in 2020 for
[Analytics](https://github.com/firebase/quickstart-ios/tree/master/analytics),
[Auth](https://github.com/firebase/quickstart-ios/tree/master/authentication),
and
[RemoteConfig](https://github.com/firebase/quickstart-ios/tree/master/config) to
use modern Swift and support multiple Apple platforms.

## Product Improvements

- [Issues marked with help-wanted tag](https://github.com/firebase/firebase-ios-sdk/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22+)
- [Pitches](https://github.com/firebase/firebase-ios-sdk/discussions/categories/pitches)
Propose and discuss ideas for Firebase improvements.
- [Feature requests](https://github.com/firebase/firebase-ios-sdk/issues?q=is%3Aissue+is%3Aopen+label%3A%22type%3A+feature+request%22)
- [All open issues](https://github.com/firebase/firebase-ios-sdk/issues)

Indicate your interest in contributing to a bug fix or feature request with a
comment. If you would like someone else to solve it, add a thumbs-up.

If you don't see the feature you're looking for, please add a
[Feature Request](https://github.com/firebase/firebase-ios-sdk/issues/new/choose).

## Improving the contributor experience

Please help others to be contributors by filing issues and adding PRs to ease
the learning curve to develop, test, and contribute to this repo.
