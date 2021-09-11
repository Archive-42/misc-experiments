/*
 * Copyright 2019 Google
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

#include "Firestore/core/test/unit/local/counting_query_engine.h"

#include "Firestore/core/src/immutable/sorted_map.h"
#include "Firestore/core/src/local/local_documents_view.h"
#include "Firestore/core/src/model/model_fwd.h"
#include "Firestore/core/src/model/mutable_document.h"
#include "Firestore/core/src/model/mutation_batch.h"
#include "Firestore/core/src/nanopb/byte_string.h"

namespace firebase {
namespace firestore {
namespace local {

using core::Query;
using model::DocumentKeySet;
using model::DocumentMap;
using model::SnapshotVersion;

// MARK: - CountingQueryEngine

CountingQueryEngine::CountingQueryEngine() = default;
CountingQueryEngine::~CountingQueryEngine() = default;

void CountingQueryEngine::SetLocalDocumentsView(
    LocalDocumentsView* local_documents) {
  remote_documents_ = absl::make_unique<WrappedRemoteDocumentCache>(
      local_documents->remote_document_cache(), this);
  mutation_queue_ = absl::make_unique<WrappedMutationQueue>(
      local_documents->mutation_queue(), this);
  local_documents_ = absl::make_unique<LocalDocumentsView>(
      remote_documents_.get(), mutation_queue_.get(),
      local_documents->index_manager());
  QueryEngine::SetLocalDocumentsView(local_documents_.get());
}

void CountingQueryEngine::ResetCounts() {
  mutations_read_by_query_ = 0;
  mutations_read_by_key_ = 0;
  documents_read_by_query_ = 0;
  documents_read_by_key_ = 0;
}

// MARK: - WrappedMutationQueue

void WrappedMutationQueue::Start() {
  subject_->Start();
}

bool WrappedMutationQueue::IsEmpty() {
  return subject_->IsEmpty();
}

void WrappedMutationQueue::AcknowledgeBatch(
    const model::MutationBatch& batch, const nanopb::ByteString& stream_token) {
  subject_->AcknowledgeBatch(batch, stream_token);
}

model::MutationBatch WrappedMutationQueue::AddMutationBatch(
    const Timestamp& local_write_time,
    std::vector<model::Mutation>&& base_mutations,
    std::vector<model::Mutation>&& mutations) {
  return subject_->AddMutationBatch(local_write_time, std::move(base_mutations),
                                    std::move(mutations));
}

void WrappedMutationQueue::RemoveMutationBatch(
    const model::MutationBatch& batch) {
  subject_->RemoveMutationBatch(batch);
}

std::vector<model::MutationBatch> WrappedMutationQueue::AllMutationBatches() {
  auto result = subject_->AllMutationBatches();
  query_engine_->mutations_read_by_key_ += result.size();
  return result;
}

std::vector<model::MutationBatch>
WrappedMutationQueue::AllMutationBatchesAffectingDocumentKeys(
    const model::DocumentKeySet& document_keys) {
  auto result =
      subject_->AllMutationBatchesAffectingDocumentKeys(document_keys);
  query_engine_->mutations_read_by_key_ += result.size();
  return result;
}

std::vector<model::MutationBatch>
WrappedMutationQueue::AllMutationBatchesAffectingDocumentKey(
    const model::DocumentKey& key) {
  auto result = subject_->AllMutationBatchesAffectingDocumentKey(key);
  query_engine_->mutations_read_by_key_ += result.size();
  return result;
}

std::vector<model::MutationBatch>
WrappedMutationQueue::AllMutationBatchesAffectingQuery(
    const core::Query& query) {
  auto result = subject_->AllMutationBatchesAffectingQuery(query);
  query_engine_->mutations_read_by_query_ += result.size();
  return result;
}

absl::optional<model::MutationBatch> WrappedMutationQueue::LookupMutationBatch(
    model::BatchId batch_id) {
  return subject_->LookupMutationBatch(batch_id);
}

absl::optional<model::MutationBatch>
WrappedMutationQueue::NextMutationBatchAfterBatchId(model::BatchId batch_id) {
  return subject_->LookupMutationBatch(batch_id);
}

model::BatchId WrappedMutationQueue::GetHighestUnacknowledgedBatchId() {
  return subject_->GetHighestUnacknowledgedBatchId();
}

void WrappedMutationQueue::PerformConsistencyCheck() {
  subject_->PerformConsistencyCheck();
}

nanopb::ByteString WrappedMutationQueue::GetLastStreamToken() {
  return subject_->GetLastStreamToken();
}

void WrappedMutationQueue::SetLastStreamToken(nanopb::ByteString stream_token) {
  subject_->SetLastStreamToken(stream_token);
}

// MARK: - WrappedRemoteDocumentCache

void WrappedRemoteDocumentCache::Add(const model::MutableDocument& document,
                                     const model::SnapshotVersion& read_time) {
  subject_->Add(document, read_time);
}

void WrappedRemoteDocumentCache::Remove(const model::DocumentKey& key) {
  subject_->Remove(key);
}

model::MutableDocument WrappedRemoteDocumentCache::Get(
    const model::DocumentKey& key) {
  auto result = subject_->Get(key);
  query_engine_->documents_read_by_key_ += result.is_found_document() ? 1 : 0;
  return result;
}

model::MutableDocumentMap WrappedRemoteDocumentCache::GetAll(
    const model::DocumentKeySet& keys) {
  auto result = subject_->GetAll(keys);
  query_engine_->documents_read_by_key_ += result.size();
  return result;
}

model::MutableDocumentMap WrappedRemoteDocumentCache::GetMatching(
    const core::Query& query, const model::SnapshotVersion& since_read_time) {
  auto result = subject_->GetMatching(query, since_read_time);
  query_engine_->documents_read_by_query_ += result.size();
  return result;
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
