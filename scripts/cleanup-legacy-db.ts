
import * as admin from 'firebase-admin';
import { AdminMigrationService } from '../apis/AdminMigrationService';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 1. Load Environment Variables
// Assuming .env is in root (one level up from scripts)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const serviceAccountVal = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountVal) {
    console.error("❌ Error: FIREBASE_SERVICE_ACCOUNT_KEY is missing in .env");
    process.exit(1);
}

// 2. Initialize Firebase Admin
try {
    const serviceAccount = JSON.parse(serviceAccountVal);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin Initialized.");
} catch (e: any) {
    console.error("❌ Failed to parse Service Account Key:", e.message);
    process.exit(1);
}

// 3. Execution Wrapper
async function runCleanup() {
    const db = admin.firestore();
    const service = AdminMigrationService.getInstance(db);

    console.log("⚠️  WARNING: This will PERMANENTLY DELETE legacy collections (songs, worships, etc).");
    console.log("⚠️  Data should have been migrated to 'teams/{teamId}/...' before running this.");
    console.log("Starting cleanup in 5 seconds... (Ctrl+C to cancel)");

    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
        await service.cleanupLegacyData((log) => console.log(`[Cleanup] ${log}`));
        console.log("✅ Cleanup Complete.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Cleanup Failed:", error);
        process.exit(1);
    }
}

// Run
runCleanup();
