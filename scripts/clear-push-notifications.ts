import * as dotenv from 'dotenv';
import * as path from 'path';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as readline from 'readline';

// 1. Load Environment Variables
// Prefer .env.local for local overrides, then fallback to .env
const localEnv = dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
const defaultEnv = dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 2. Initialize Firebase Admin
const serviceAccountPath = path.resolve(process.cwd(), 'firebase-admin-private-key.json');

try {
    if (!fs.existsSync(serviceAccountPath)) {
        console.error("\n❌ Error: firebase-admin-private-key.json not found in project root.");
        console.error("Please download it from Firebase Console -> Project Settings -> Service Accounts");
        console.error("and place it at:", serviceAccountPath);
        process.exit(1);
    }

    const serviceAccount = require(serviceAccountPath);

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log(`✅ Firebase Admin Initialized (Project: ${serviceAccount.project_id})`);
    }
} catch (e: any) {
    console.error("❌ Auth Error:", e.message);
    process.exit(1);
}

// 3. Execution Logic
async function clearPushNotifications() {
    const dbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;
    let db;

    if (dbId) {
        console.log(`\n📂 Target Database: ${dbId}`);
        const { getFirestore } = require('firebase-admin/firestore');
        db = getFirestore(dbId);
    } else {
        console.log(`\n📂 Target Database: (default)`);
        db = admin.firestore();
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("\n===================================================");
    console.log("⚠️  CLEAR PUSH NOTIFICATIONS TOOL");
    console.log("===================================================");
    console.log("This script will iterate through ALL 'account_settings' documents");
    console.log("and REMOVE all push notification subscriptions.");
    console.log("\nUse this to sanitize data after importing production dumps to staging/local.");

    const answer = await new Promise<string>(resolve => rl.question('\nType "clear" to confirm: ', resolve));

    if (answer !== 'clear') {
        console.log("❌ Cancelled.");
        rl.close();
        process.exit(0);
    }

    console.log("\n🚀 Starting cleanup process...");

    try {
        const settingsRef = db.collection("account_settings");
        const snapshot = await settingsRef.get();

        if (snapshot.empty) {
            console.log("✅ No account settings found.");
            process.exit(0);
        }

        console.log(`📦 Found ${snapshot.size} account settings.`);

        const BATCH_SIZE = 450;
        const chunks = [];
        const docs = snapshot.docs;

        for (let i = 0; i < docs.length; i += BATCH_SIZE) {
            chunks.push(docs.slice(i, i + BATCH_SIZE));
        }

        let totalUpdated = 0;

        for (let index = 0; index < chunks.length; index++) {
            const chunk = chunks[index];
            const batch = db.batch();
            let batchCount = 0;

            chunk.forEach(docSnap => {
                const data = docSnap.data();
                // Check if clearing is needed
                if ((data.push_notification?.subscriptions && data.push_notification.subscriptions.length > 0) ||
                    data.push_notification?.is_enabled === true) {

                    const ref = settingsRef.doc(docSnap.id);
                    batch.update(ref, {
                        "push_notification.subscriptions": [],
                        "push_notification.is_enabled": false,
                        "push_notification.updated_at": new Date().toISOString()
                    });
                    batchCount++;
                }
            });

            if (batchCount > 0) {
                await batch.commit();
                totalUpdated += batchCount;
                console.log(`✅ Batch ${index + 1}/${chunks.length} committed (${batchCount} updates).`);
            } else {
                console.log(`⏭️  Batch ${index + 1}/${chunks.length} skipped (no changes needed).`);
            }
        }

        console.log(`\n🎉 Cleanup Complete! Updated ${totalUpdated} users.`);

    } catch (error: any) {
        console.error("\n❌ Error:", error.message);
    } finally {
        rl.close();
        process.exit(0);
    }
}

// Run
clearPushNotifications();
