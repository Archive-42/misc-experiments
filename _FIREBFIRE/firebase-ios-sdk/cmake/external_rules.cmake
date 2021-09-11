# Copyright 2018 Google LLC
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

function(download_external_sources)
  file(MAKE_DIRECTORY ${PROJECT_BINARY_DIR}/external)

  set(DOWNLOAD_BENCHMARK ${FIREBASE_IOS_BUILD_BENCHMARKS})
  set(DOWNLOAD_GOOGLETEST ${FIREBASE_IOS_BUILD_TESTS})

  execute_process(
    COMMAND
      ${CMAKE_COMMAND} -G "${CMAKE_GENERATOR}"
      -DFIREBASE_DOWNLOAD_DIR=${FIREBASE_DOWNLOAD_DIR}
      -DCMAKE_INSTALL_PREFIX=${FIREBASE_INSTALL_DIR}
      -DFUZZING=${FUZZING}
      -DDOWNLOAD_BENCHMARK=${DOWNLOAD_BENCHMARK}
      -DDOWNLOAD_GOOGLETEST=${DOWNLOAD_GOOGLETEST}
      ${PROJECT_SOURCE_DIR}/cmake/external
    WORKING_DIRECTORY ${PROJECT_BINARY_DIR}/external
  )

  # Run downloads in parallel if we know how
  if(CMAKE_GENERATOR STREQUAL "Unix Makefiles")
    set(cmake_build_args -j)
  endif()

  execute_process(
    COMMAND ${CMAKE_COMMAND} --build . -- ${cmake_build_args}
    WORKING_DIRECTORY ${PROJECT_BINARY_DIR}/external
  )
endfunction()

function(add_external_subdirectory NAME)
  string(TOUPPER ${NAME} UPPER_NAME)
  if (NOT EXISTS ${${UPPER_NAME}_SOURCE_DIR})
    set(${UPPER_NAME}_SOURCE_DIR "${FIREBASE_BINARY_DIR}/external/src/${NAME}")
    set(${UPPER_NAME}_SOURCE_DIR "${${UPPER_NAME}_SOURCE_DIR}" PARENT_SCOPE)
  endif()

  if (NOT EXISTS ${${UPPER_NAME}_BINARY_DIR})
    set(${UPPER_NAME}_BINARY_DIR "${${UPPER_NAME}_SOURCE_DIR}-build")
    set(${UPPER_NAME}_BINARY_DIR "${${UPPER_NAME}_BINARY_DIR}" PARENT_SCOPE)
  endif()

  if (EXISTS "${${UPPER_NAME}_SOURCE_DIR}/CMakeLists.txt")
    add_subdirectory(
      ${${UPPER_NAME}_SOURCE_DIR}
      ${${UPPER_NAME}_BINARY_DIR}
      EXCLUDE_FROM_ALL
    )
  endif()
endfunction()
