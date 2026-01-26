#!/bin/bash
set -e

# Configuration
PROJECT_ID="wooriworship-94403"
SOURCE_DB="stg-env"
BUCKET_NAME="firestore-default-snapshot"
TIMESTAMP=$(date +"%Y%m%d_%H%M")
EXPORT_PATH="gs://${BUCKET_NAME}/${TIMESTAMP}/v2"

echo "========================================="
echo "📸 Staging V2 Snapshot: stg-env -> GCS"
echo "========================================="
echo "📅 Timestamp: ${TIMESTAMP}"
echo "📂 Export Path: ${EXPORT_PATH}"
echo "-----------------------------------------"

# 1. Export from Staging DB
echo "🚀 [1/1] Exporting from '${SOURCE_DB}'..."
gcloud firestore export "${EXPORT_PATH}" --database="${SOURCE_DB}" --project="${PROJECT_ID}"

echo "========================================="
echo "✅ Export completed to: ${EXPORT_PATH}"
echo "========================================="
