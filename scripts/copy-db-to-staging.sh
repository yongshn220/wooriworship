#!/bin/bash
set -e

# 설정 변수
PROJECT_ID="wooriworship-94403"
SOURCE_DB="(default)"
TARGET_DB="stg-env"
BUCKET_NAME="firestore-default-snapshot"
TIMESTAMP=$(date +"%Y%m%d_%H%M") # Request format: 20260114_1613
EXPORT_PATH="gs://${BUCKET_NAME}/${TIMESTAMP}/prod"

echo "========================================="
echo "📦 Firestore Data Sync: Prod -> Staging"
echo "========================================="
echo "📅 Timestamp: ${TIMESTAMP}"
echo "📂 Export Path: ${EXPORT_PATH}"
echo "-----------------------------------------"

# 1. Export from Source DB (Prod)
echo "🚀 [1/2] Exporting from '${SOURCE_DB}'..."
# Note: --async option is removed to ensure export completes before import starts.
gcloud firestore export "${EXPORT_PATH}" --database="${SOURCE_DB}" --project="${PROJECT_ID}"

echo "✅ Export completed to: ${EXPORT_PATH}"

# 2. Prepare Target DB (Staging)
echo "🛠 [2/3] Preparing '${TARGET_DB}'..."

# DB 존재 여부 확인
if gcloud firestore databases describe --database="${TARGET_DB}" --project="${PROJECT_ID}" > /dev/null 2>&1; then
  echo "🔥 Database exists. Wiping all data..."
  # -f 옵션 추가로 non-interactive 실행 보장
  firebase firestore:delete --database="${TARGET_DB}" --all-collections --force --project="${PROJECT_ID}"
else
  echo "🆕 Database not found. Creating new database..."
  # location: nam5 (us-central)
  gcloud firestore databases create --database="${TARGET_DB}" --location="nam5" --type=firestore-native --project="${PROJECT_ID}"
fi

# 3. Import to Target DB (Staging)
echo "📥 [3/3] Importing to '${TARGET_DB}'..."
gcloud firestore import "${EXPORT_PATH}" --database="${TARGET_DB}" --project="${PROJECT_ID}"

echo "========================================="
echo "🎉 Done! Data synced to '${TARGET_DB}'."
echo "========================================="
