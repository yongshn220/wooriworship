import * as dotenv from 'dotenv';
import * as path from 'path';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import { AdminMigrationApi } from '../apis/AdminMigrationApi';

// 1. Main Execution
(async () => {
    try {
        console.log("=========================================");
        console.log("🚀 V2 -> V3 Migration (Relational Schema)");
        console.log("=========================================");

        // 2. Load Env Vars
        dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
        dotenv.config({ path: path.resolve(__dirname, '../.env') });

        // 3. Initialize Admin SDK
        const serviceAccountPath = path.resolve(process.cwd(), 'firebase-admin-private-key.json');
        if (!fs.existsSync(serviceAccountPath)) {
            console.error("❌ Error: firebase-admin-private-key.json not found.");
            process.exit(1);
        }
        const serviceAccount = require(serviceAccountPath);

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }

        const dbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || undefined;
        console.log(`\n🔍 DB: ${dbId || "(default)"}`);

        // SAFETY: Enforce 'stg' in DB name (case-insensitive)
        if (!dbId || !dbId.toLowerCase().includes("stg")) {
            console.error("\n⛔ SAFETY ALERT: Migration blocked!");
            console.error("   Reason: You are attempting to run this on a NON-STAGING database.");
            console.error(`   Current DB: ${dbId || "(default)"}`);
            console.error("   Required: DB name must contain 'stg'.");
            process.exit(1);
        }

        let db;
        if (dbId) {
            const { getFirestore } = require('firebase-admin/firestore');
            db = getFirestore(dbId);
        } else {
            db = admin.firestore();
        }

        const service = AdminMigrationApi.getInstance(db);

        // 4. Fetch All Teams
        console.log("\n🔍 Fetching all teams...");
        const teamsSnapshot = await db.collection("teams").get();
        const teamIds = teamsSnapshot.docs.map(d => d.id);

        console.log(`Found ${teamIds.length} teams: [${teamIds.join(", ")}]`);

        // 5. Confirmation
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log(`\n⚠️  Ready to migrate ALL ${teamIds.length} teams V2 -> V3.`);
        const answer = await new Promise<string>(resolve => readline.question('Type "yes" to proceed: ', resolve));

        if (answer.toLowerCase() !== 'yes') {
            console.log("❌ Aborted.");
            process.exit(0);
        }

        // 6. Run Loop
        console.log("\n🚀 Starting Global Migration...");
        for (const teamId of teamIds) {
            await service.migrateToUnifiedServices(teamId);
        }

        console.log("\n🎉 Global V3 Migration Done!");
        readline.close();
        process.exit(0);

    } catch (error: any) {
        console.error("\n❌ Fatal Error:", error);
        process.exit(1);
    }
})();
