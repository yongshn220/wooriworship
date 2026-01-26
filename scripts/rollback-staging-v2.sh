#!/bin/bash
set -e

# Configuration
PROJECT_ID="wooriworship-94403"
TARGET_DB="stg-env"
BUCKET_NAME="firestore-default-snapshot"

echo "========================================="
echo "⏪ ROLLBACK: Staging V3 -> V2"
echo "========================================="
echo "Target Database: ${TARGET_DB} (STAGING)"
echo "Source Bucket:   gs://${BUCKET_NAME}"
echo "-----------------------------------------"

# 1. Find the latest V2 snapshot
echo "🔍 [1/3] Finding latest V2 snapshot..."
# List prefixes, filter for /v2/ suffix in the inner path, pick latest
# Snapshot paths are gs://BUCKET/TIMESTAMP/v2/
LATEST_SNAPSHOT=$(gsutil ls "gs://${BUCKET_NAME}/*/v2/" | sort | tail -n 1)

if [ -z "$LATEST_SNAPSHOT" ]; then
  echo "❌ No V2 snapshots found in gs://${BUCKET_NAME}/*/v2/"
  exit 1
fi

echo "✅ Found latest V2 snapshot: ${LATEST_SNAPSHOT}"

# 2. Confirmation
echo ""
echo "⚠️  WARNING: You are about to WIPE and RESTORE Staging Data in '${TARGET_DB}'"
echo "    to the V2 state from: ${LATEST_SNAPSHOT}"
echo ""
read -p "Type 'ROLLBACK' to confirm: " CONFIRM

if [ "$CONFIRM" != "ROLLBACK" ]; then
  echo "❌ Rollback cancelled."
  exit 1
fi

# 3. Wipe Target DB
echo "🔥 [2/3] Wiping all data in '${TARGET_DB}'..."
firebase firestore:delete --database="${TARGET_DB}" --all-collections --force --project="${PROJECT_ID}"

# 4. Import
echo "📥 [3/3] Importing V2 snapshot..."
gcloud firestore import "${LATEST_SNAPSHOT}" --database="${TARGET_DB}" --project="${PROJECT_ID}"

echo "========================================="
echo "🎉 Rollback Complete!"
echo "   Staging has been restored to V2 state."
echo "========================================="
