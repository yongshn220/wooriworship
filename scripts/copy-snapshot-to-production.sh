#!/bin/bash
set -e

# Configuration
PROJECT_ID="wooriworship-94403"
TARGET_DB="(default)"  # Restoring TO Production
BUCKET_NAME="firestore-default-snapshot"

echo "========================================="
echo "🚨 PRODUCTION DISASTER RECOVERY RESTORE 🚨"
echo "========================================="
echo "Target Database: ${TARGET_DB} (PRODUCTION)"
echo "Source Bucket:   gs://${BUCKET_NAME}"
echo "-----------------------------------------"

# 1. Find the latest export
echo "🔍 [1/3] Finding latest snapshot..."
# List "directories" in the bucket, sort by time (tail), pick the last one
LATEST_SNAPSHOT=$(gsutil ls "gs://${BUCKET_NAME}/" | grep -E '[0-9]{8}_[0-9]{4}/$' | sort | tail -n 1)

if [ -z "$LATEST_SNAPSHOT" ]; then
  echo "❌ No snapshots found in gs://${BUCKET_NAME}/"
  exit 1
fi

echo "✅ Found latest snapshot: ${LATEST_SNAPSHOT}"

# 2. Confirmation
echo ""
echo "⚠️  WARNING: You are about to OVERWRITE Production Data in '${TARGET_DB}'"
echo "    with data from: ${LATEST_SNAPSHOT}"
echo ""
read -p "Type 'RESTORE' to confirm: " CONFIRM

if [ "$CONFIRM" != "RESTORE" ]; then
  echo "❌ Restore cancelled."
  exit 1
fi

# 3. Import
echo ""
echo "📥 [2/3] Starting Import Operation..."
# Note: Firestore Import adds/overwrites data but does not delete documents that don't exist in the snapshot.
# For a full clean restore, one might normally wipe the DB first, but that's extremely dangerous in a script.
# We will do a standard import which is safer for recovery (merges/overwrites).

gcloud firestore import "${LATEST_SNAPSHOT}prod" --database="${TARGET_DB}" --project="${PROJECT_ID}"

echo "========================================="
echo "🎉 Restore Complete!"
echo "   Data from ${LATEST_SNAPSHOT} has been imported to ${TARGET_DB}."
echo "========================================="
