# Code Coverage Report Generation

This tool is to help generate coverage reports for pull requests. It's defined by the [test_coverage  workflow](https://github.com/firebase/firebase-ios-sdk/blob/master/scripts/health_metrics/code_coverage_file_list.json).

Coverage reports of SDK frameworks will be displayed in a pull request if the change is under corresponding SDK file patterns.

[UpdatedFilesCollector](https://github.com/firebase/firebase-ios-sdk/tree/master/scripts/health_metrics/generate_code_coverage_report/Sources/UpdatedFilesCollector) will detect file changes and compare file paths to file patterns in [code_coverage_file_list.json](https://github.com/firebase/firebase-ios-sdk/blob/master/scripts/health_metrics/code_coverage_file_list.json). If updated file paths fit any patterns, corresponding SDK coverage job will be triggered.

## Add a new coverage workflow

To create a code coverage workflow for a new SDK,
1. Add `newsdk` and its patterns in [code_coverage_file_list.json](https://github.com/firebase/firebase-ios-sdk/blob/master/scripts/health_metrics/code_coverage_file_list.json).
2. Add a new output flag, e.g. `newsdk_run_job`, in the [coverage workflow](https://github.com/firebase/firebase-ios-sdk/blob/64d50a7f7b3af104a88f9c9203285ae20ea309d4/.github/workflows/test_coverage.yml#L17). `newsdk_run_job` should be aligned with the name of SDK `newsdk` in code_coverage_file_list.json.
3. Add a newsdk coverage job in the [workflow](https://github.com/firebase/firebase-ios-sdk/blob/master/.github/workflows/test_coverage.yml):
```
pod-lib-lint-newsdk:
    needs: check
    # Don't run on private repo unless it is a PR.
    if: always() && github.repository == 'Firebase/firebase-ios-sdk' && (needs.check.outputs.newsdk_run_job == 'true'|| github.event.pull_request.merged)
    runs-on: macOS-latest
    strategy:
      matrix:
        target: [iOS]
    steps:
    - uses: actions/checkout@v2
    - name: Setup Bundler
      run: scripts/setup_bundler.sh
    - name: Build and test
      run: ./scripts/health_metrics/pod_test_code_coverage_report.sh FirebaseNewSDK "${{ matrix.target }}"
    - uses: actions/upload-artifact@v2
      with:
        name: codecoverage
        path: /Users/runner/*.xcresult
```
Add the job name to the [`needs` of `create_report` job](https://github.com/firebase/firebase-ios-sdk/blob/64d50a7f7b3af104a88f9c9203285ae20ea309d4/.github/workflows/test_coverage.yml#L277).

4. If this newsdk podspec has unit test setup, e.g. [database](https://github.com/firebase/firebase-ios-sdk/blob/64d50a7f7b3af104a88f9c9203285ae20ea309d4/FirebaseDatabase.podspec#L44-L57), with `unit_tests.scheme = { :code_coverage => true }`, the code coverage workflow should run unit tests through podspecs and utilize those coverage data and nothing is needed to update here. Otherwise, add [another way of running tests](https://github.com/firebase/firebase-ios-sdk/blob/64d50a7f7b3af104a88f9c9203285ae20ea309d4/scripts/health_metrics/pod_test_code_coverage_report.sh#L26) and generating xcresult bundles with code coverage data in pod_test_code_coverage_report.sh.
