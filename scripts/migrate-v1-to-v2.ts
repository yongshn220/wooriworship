import * as dotenv from 'dotenv';
import * as path from 'path';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import { AdminMigrationApi } from '../apis/AdminMigrationApi';

// 1. Main Execution
(async () => {
    try {
        console.log("=========================================");
        console.log("🚀 Custom Database Migration Tool (CLI - Admin SDK)");
        console.log("=========================================");

        // 2. Load Env Vars (Optional but good for debug)
        const localEnv = dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
        if (localEnv.parsed) console.log("✅ Loaded .env.local");

        const defaultEnv = dotenv.config({ path: path.resolve(__dirname, '../.env') });
        if (defaultEnv.parsed) console.log("✅ Loaded .env");

        // 3. Initialize Admin SDK
        const serviceAccountPath = path.resolve(process.cwd(), 'firebase-admin-private-key.json');

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

        // Determine Database ID
        // Priority: .env.local -> .env -> (default)
        const dbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || undefined;

        console.log(`\n🔍 Checking Safety Guard for DB: ${dbId || "(default)"}`);

        // SAFETY GUARD: Enforce Staging Environment
        // Allows "stg-env", "STGENV", "staging", etc.
        const isStaging = dbId && dbId.toLowerCase().includes("stg");

        if (!isStaging) {
            console.error("\n⛔ SAFETY ALERT: Migration blocked!");
            console.error("   Reason: Use a Staging database (must contain 'stg') for migration scripts.");
            console.error(`   Current DB: ${dbId || "(default)"}`);
            process.exit(1);
        }

        let db;
        if (dbId) {
            console.log(`📂 Target Database: ${dbId}`);
            const { getFirestore } = require('firebase-admin/firestore');
            db = getFirestore(dbId);
        } else {
            // Should be unreachable due to check above, but for type safety
            db = admin.firestore();
        }

        const migrationService = AdminMigrationApi.getInstance(db);

        // 4. Confirmation
        // Dynamic import logic removed - using standard requires/imports now as we are in Node environment
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log("\n⚠️  WARNING: This will modify the database structure using Admin Privileges.");
        const answer = await new Promise<string>(resolve => readline.question('Type "yes" to proceed: ', resolve));

        if (answer.toLowerCase() !== 'yes') {
            console.log("❌ Aborted.");
            process.exit(0);
        }

        // 5. Run Migration
        console.log("\n🚀 Starting Migration...");
        const success = await migrationService.runFullMigration((log: string) => {
            console.log(`[Migration] ${log}`);
        });

        if (success) {
            console.log("\n🎉 Migration Finished Successfully!");
        } else {
            console.error("\n❌ Migration Failed. Check logs.");
        }

        readline.close();
        process.exit(0);

    } catch (error: any) {
        console.error("\n❌ Fatal Error:", error.message || error);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
})();
