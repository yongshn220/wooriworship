
import * as admin from 'firebase-admin';
import { AdminMigrationService } from '../apis/AdminMigrationService';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 2. Initialize Firebase Admin
const envServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const jsonFilePath = path.resolve(__dirname, '../firebase-admin-private-key.json');

let serviceAccount: any;

try {
    if (envServiceAccount) {
        serviceAccount = JSON.parse(envServiceAccount);
        console.log("✅ Credentials loaded from ENV.");
    } else if (fs.existsSync(jsonFilePath)) {
        serviceAccount = require(jsonFilePath);
        console.log("✅ Credentials loaded from JSON file.");
    } else {
        throw new Error("Missing Credentials! Set FIREBASE_SERVICE_ACCOUNT_KEY in .env or provide firebase-admin-private-key.json");
    }

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("✅ Admin SDK Initialized.");
    }
} catch (e: any) {
    console.error("❌ Auth Error:", e.message);
    process.exit(1);
}

// 3. Execution Wrapper
async function runCleanup() {
    const db = admin.firestore();
    const service = AdminMigrationService.getInstance(db);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("\n⚠️  DANGER ZONE: This will PERMANENTLY DELETE strict legacy collections:");
    console.log("   - songs, worships, music_sheets, song_comments, notices, tags");
    console.log("⚠️  Ensure data is migrated before proceeding.");

    const answer = await new Promise<string>(resolve => rl.question('\nType "delete" to confirm cleanup: ', resolve));

    if (answer !== 'delete') {
        console.log("❌ Cancelled.");
        rl.close();
        process.exit(0);
    }

    rl.close();

    try {
        console.log("🚀 Starting cleanup...");
        await service.cleanupLegacyData((log) => console.log(`[Cleanup] ${log}`));
        console.log("✅ Cleanup Finished Successfully.");
        process.exit(0);
    } catch (error: any) {
        console.error("❌ Cleanup Failed:", error.message || error);
        process.exit(1);
    }
}

// Run
runCleanup();
