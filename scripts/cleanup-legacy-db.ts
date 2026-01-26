
import * as admin from 'firebase-admin';
import { AdminMigrationService } from '../apis/AdminMigrationService';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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
        console.log("✅ Admin SDK Initialized (File: firebase-admin-private-key.json)");
    }
} catch (e: any) {
    console.error("❌ Auth Error:", e.message);
    process.exit(1);
}

// 3. Execution Wrapper
async function runCleanup() {
    // 3a. Determine Database ID & Safety Check
    const dbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || undefined;

    console.log(`\n🔍 Checking Safety Guard for DB: ${dbId || "(default)"}`);

    // SAFETY GUARD: Enforce Staging Environment
    // Allows "stg-env", "STGENV", "staging", etc.
    const isStaging = dbId && dbId.toLowerCase().includes("stg");

    if (!isStaging) {
        console.error("\n⛔ SAFETY ALERT: Cleanup blocked!");
        console.error("   Reason: Use a Staging database (must contain 'stg') for cleanup scripts.");
        console.error(`   Current DB: ${dbId || "(default)"}`);
        process.exit(1);
    }

    let db;
    if (dbId) {
        console.log(`📂 Target Database: ${dbId}`);
        const { getFirestore } = require('firebase-admin/firestore');
        db = getFirestore(dbId);
    } else {
        db = admin.firestore();
    }

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
