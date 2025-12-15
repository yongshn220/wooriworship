const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const { FirestoreAdminClient } = require('@google-cloud/firestore').v1;

// Configuration
const PROJECT_ID = 'wooriworship-94403';
const BACKUP_BUCKET_NAME = 'wooriworship_database';
const SOURCE_STORAGE_BUCKET = 'wooriworship-94403.appspot.com';

admin.initializeApp({ projectId: PROJECT_ID });
const storage = new Storage({ projectId: PROJECT_ID });
const firestoreAdmin = new FirestoreAdminClient();

functions.cloudEvent('backupFirestore', async (cloudEvent) => {
    console.log("🚀 Starting backup process");

    try {
        // Ensure lifecycle rule is set (idempotent)
        await configureBucketLifecycle();

        // Run backups in parallel
        await Promise.all([
            backupFirebaseStorage(),
            backupFirestoreManaged(),
        ]);
        console.log("✅ All backups completed successfully.");
    } catch (e) {
        console.error('❌ Error during backup process:', e);
        throw e;
    }
});

/**
 * Configures the backup bucket to automatically delete objects older than 7 days.
 */
async function configureBucketLifecycle() {
    console.log("⚙️  Checking bucket lifecycle rules...");
    const bucket = storage.bucket(BACKUP_BUCKET_NAME);

    // Define the rule: Delete objects with age > 7 days
    const lifecycleRule = {
        action: {
            type: 'Delete',
        },
        condition: {
            age: 7, // days
        },
    };

    try {
        const [metadata] = await bucket.getMetadata();
        const rules = metadata.lifecycle ? metadata.lifecycle.rule : [];

        // Check if our rule roughly exists to avoid unnecessary API calls (simple check)
        const hasRule = rules.some(r =>
            r.action && r.action.type === 'Delete' &&
            r.condition && r.condition.age === 7
        );

        if (!hasRule) {
            console.log("⚠️  Lifecycle rule not found. Adding 7-day retention policy...");
            // We append to existing rules or create new
            const newRules = [...rules, lifecycleRule];
            await bucket.setMetadata({
                lifecycle: {
                    rule: newRules
                }
            });
            console.log("✅ Lifecycle rule set: Delete objects older than 7 days.");
        } else {
            console.log("✅ Lifecycle rule already exists.");
        }

    } catch (e) {
        console.error("⚠️  Failed to configure bucket lifecycle (non-fatal):", e.message);
        // We don't throw here strictly, as backup is more important than retention setting failure
    }
}

/**
 * Uses Google's native managed export.
 */
async function backupFirestoreManaged() {
    console.log("📦 Starting Firestore Managed Export...");
    const date = new Date().toISOString().split("T")[0];
    const outputUriPrefix = `gs://${BACKUP_BUCKET_NAME}/firestore-export/${date}`;

    const databaseName = firestoreAdmin.databasePath(PROJECT_ID, '(default)');

    try {
        const [operation] = await firestoreAdmin.exportDocuments({
            name: databaseName,
            outputUriPrefix: outputUriPrefix,
        });

        console.log(`⏳ Firestore export operation started: ${operation.name}`);
        console.log(`✅ Firestore export initiated to: ${outputUriPrefix}`);
    } catch (err) {
        console.error("❌ Firestore export failed:", err);
        throw err;
    }
}

/**
 * Copies files with concurrency control.
 */
async function backupFirebaseStorage() {
    console.log("🗂 Starting Firebase Storage backup...");
    const date = new Date().toISOString().split("T")[0];

    const sourceBucket = storage.bucket(SOURCE_STORAGE_BUCKET);
    const destBucket = storage.bucket(BACKUP_BUCKET_NAME);

    // Get all files
    const [files] = await sourceBucket.getFiles();

    if (files.length === 0) {
        console.log("No files to backup.");
        return;
    }

    // Process in chunks of 50
    const CHUNK_SIZE = 50;
    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        const chunk = files.slice(i, i + CHUNK_SIZE);

        await Promise.all(chunk.map(file => {
            const destinationPath = `firebase_storage_backup/${date}/${file.name}`;
            return file.copy(destBucket.file(destinationPath))
                .catch(e => console.error(`Failed to copy ${file.name}:`, e));
        }));

        console.log(`Processed ${Math.min(i + CHUNK_SIZE, files.length)} / ${files.length} files`);
    }

    console.log("✅ Storage backup completed.");
}
