#!/bin/bash
set -e

# Configuration
PROJECT_ID="wooriworship-94403"
DEFAULT_DB="(default)"
STAGING_DB="stg-env"
BUCKET_NAME="firestore-default-snapshot"
TIMESTAMP=$(date +"%Y%m%d_%H%M")

# Export paths
DEFAULT_EXPORT_PATH="gs://${BUCKET_NAME}/${TIMESTAMP}/default-backup"
STAGING_EXPORT_PATH="gs://${BUCKET_NAME}/${TIMESTAMP}/staging-backup"

echo "============================================="
echo "🚀 Deploy stg-env to (default) [PRODUCTION]"
echo "============================================="
echo "📅 Timestamp: ${TIMESTAMP}"
echo "📦 Default Backup: ${DEFAULT_EXPORT_PATH}"
echo "📦 Staging Backup: ${STAGING_EXPORT_PATH}"
echo "---------------------------------------------"

# Confirmation
echo ""
echo "⚠️  WARNING: You are about to DEPLOY staging data to PRODUCTION"
echo ""
read -p "Type 'DEPLOY' to confirm: " CONFIRM

if [ "$CONFIRM" != "DEPLOY" ]; then
  echo "❌ Deploy cancelled."
  exit 1
fi

# Step 1: Backup (default) to bucket (production rollback)
echo ""
echo "🚀 [1/4] Backing up '${DEFAULT_DB}' (production) to bucket..."
gcloud firestore export "${DEFAULT_EXPORT_PATH}" --database="${DEFAULT_DB}" --project="${PROJECT_ID}"
echo "✅ Production backup completed: ${DEFAULT_EXPORT_PATH}"

# Step 2: Backup stg-env to bucket (deploy version)
echo ""
echo "🚀 [2/4] Backing up '${STAGING_DB}' (staging) to bucket..."
gcloud firestore export "${STAGING_EXPORT_PATH}" --database="${STAGING_DB}" --project="${PROJECT_ID}"
echo "✅ Staging backup completed: ${STAGING_EXPORT_PATH}"

# Step 3: Wipe (default)
echo ""
echo "🛠 [3/4] Wiping '${DEFAULT_DB}' (production) data..."
firebase firestore:delete --database="${DEFAULT_DB}" --all-collections --force --project="${PROJECT_ID}"
echo "✅ Production DB wiped"

# Step 4: Import stg-env backup to (default)
echo ""
echo "📥 [4/4] Deploying '${STAGING_DB}' data to '${DEFAULT_DB}'..."
gcloud firestore import "${STAGING_EXPORT_PATH}" --database="${DEFAULT_DB}" --project="${PROJECT_ID}"

echo ""
echo "============================================="
echo "🎉 Done! '${STAGING_DB}' deployed to '${DEFAULT_DB}'"
echo "============================================="
echo ""
echo "💾 Backups saved:"
echo "   - Production (rollback): ${DEFAULT_EXPORT_PATH}"
echo "   - Staging (deployed):    ${STAGING_EXPORT_PATH}"
echo ""
echo "🔙 To rollback production, run:"
echo "   gcloud firestore import ${DEFAULT_EXPORT_PATH} --database='${DEFAULT_DB}' --project=${PROJECT_ID}"
echo ""
