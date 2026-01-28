import * as dotenv from 'dotenv';
import * as path from 'path';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import { AdminMigrationApi } from '../apis/AdminMigrationApi';

// 1. Main Execution
(async () => {
    try {
        console.log("=========================================");
        console.log("🗑️  Cleanup V2 Collections (Worships/Schedules)");
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

        if (!dbId || !dbId.toLowerCase().includes("stg")) {
            console.error("\n⛔ SAFETY ALERT: Cleanup blocked!");
            console.error("   Reason: You are attempting to DELETE data on a NON-STAGING database.");
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

        console.log(`\n⚠️  DANGER: Deleting 'worships' & 'serving_schedules' for ALL ${teamIds.length} teams.`);
        const answer = await new Promise<string>(resolve => readline.question('Type "delete" to confirm: ', resolve));

        if (answer !== 'delete') {
            console.log("❌ Aborted.");
            process.exit(0);
        }

        // 6. Run Loop
        console.log("\n🚀 Starting Global Cleanup...");
        for (const teamId of teamIds) {
            await service.nukeV2Collections(teamId);
        }

        console.log("\n🎉 Global Cleanup Done!");
        readline.close();
        process.exit(0);

    } catch (error: any) {
        console.error("\n❌ Fatal Error:", error);
        process.exit(1);
    }
})();
