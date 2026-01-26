
import * as admin from 'firebase-admin';
import { AdminMigrationService } from '../apis/AdminMigrationService';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import * as fs from 'fs';

// 2. Initialize Firebase Admin
// Priority: 1. Env Var  2. Local JSON File
const envServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const jsonFilePath = path.resolve(__dirname, '../firebase-admin-private-key.json');

let serviceAccount: any;

try {
    if (envServiceAccount) {
        serviceAccount = JSON.parse(envServiceAccount);
        console.log("✅ Loaded credentials from Environment Variable.");
    } else if (fs.existsSync(jsonFilePath)) {
        serviceAccount = require(jsonFilePath);
        console.log("✅ Loaded credentials from firebase-admin-private-key.json");
    } else {
        throw new Error("No credentials found. Set FIREBASE_SERVICE_ACCOUNT_KEY in .env or place firebase-admin-private-key.json in root.");
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin Initialized.");
} catch (e: any) {
    console.error("❌ Failed to initialize Firebase Admin:", e.message);
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
