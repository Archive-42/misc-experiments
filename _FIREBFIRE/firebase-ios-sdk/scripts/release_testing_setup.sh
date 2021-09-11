# Copyright 2020 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# This script will `git clone` the SDK repo to local and look for the latest
# release branch
set -xe

TESTINGMODE=${1-}

if [ -f "${HOME}/.cocoapods/repos" ]; then
  find "${HOME}/.cocoapods/repos" -type d -maxdepth 1 -exec sh -c 'pod repo remove $(basename {})' \;
fi

mkdir -p "${local_sdk_repo_dir}"
echo "git clone ${podspec_repo_branch} from github.com/firebase/firebase-ios-sdk.git to ${local_sdk_repo_dir}"
set +x
# Using token here to update tags later.
git clone -q https://"${BOT_TOKEN}"@github.com/firebase/firebase-ios-sdk.git "${local_sdk_repo_dir}"
set -x

cd  "${local_sdk_repo_dir}"
# The chunk below is to determine the latest version by searching
# Get the latest origin/release-X.Y.Z branch in the remote repo for release branch testing.
release_branch=$(git branch -l -r --sort=-version:refname origin/release-* | head -n 1 )
# Get the latest released tag Cocoapods-X.Y.Z for prerelease testing, beta version will be excluded.
test_version=$(git tag -l --sort=-version:refname CocoaPods-*[0-9] | head -n 1)

if [ -z $podspec_repo_branch ];then
  # Get release branch, origin/release-X.Y.Z.
  podspec_repo_branch=$(echo $release_branch | sed -n 's/\s*//p')
fi

git config --global user.email "google-oss-bot@example.com"
git config --global user.name "google-oss-bot"
git checkout "${podspec_repo_branch}"
if [ "$TESTINGMODE" = "release_testing" ]; then
  # Latest release branch with prefix CocoaPods, e.g. CocoaPods-7.11
  latest_branch_version=$(git branch -l -r --sort=-v:refname origin/release-* | head -n 1 | sed -n 's/^[ \t]*origin\/release/CocoaPods/p' )
  # Latest tag of release branch on the repo, e.g. Cocoapods-7.9.0
  latest_release_branch_tag=$(git tag -l --sort=-version:refname "$latest_branch_version"*[0-9] | head -n 1)
  echo "Podspecs tags of Nightly release testing will be updated to ${latest_release_branch_tag}."
  # Update source and tag, e.g.  ":tag => 'CocoaPods-' + s.version.to_s" to
  # ":tag => 'CocoaPods-7.9.0'"
  sed  -i "" "s/\s*:tag.*/:tag => '${latest_release_branch_tag}'/" *.podspec
elif [ "$TESTINGMODE" = "prerelease_testing" ]; then
  tag_version="${test_version}.nightly"
  echo "A new tag, ${tag_version},for prerelease testing will be created."
  set +e
  # If tag_version is new to the remote, remote cannot delete a non-existent
  # tag, so error is allowed here.
  git push origin --delete "${tag_version}"
  set -e
  git tag -f -a "${tag_version}" -m "release testing"
  git push origin "${tag_version}"
  # Update source and tag, e.g.  ":tag => 'CocoaPods-' + s.version.to_s" to
  # ":tag => ${test_version}.nightly"
  sed  -i "" "s/\s*:tag.*/:tag => '${tag_version}'/" *.podspec
fi
