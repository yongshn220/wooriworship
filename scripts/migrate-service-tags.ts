import * as dotenv from 'dotenv';
import * as path from 'path';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import { AdminMigrationApi } from '../apis/AdminMigrationApi';

// Main Execution
(async () => {
    try {
        console.log("====================================================");
        console.log("🚀 Service Tags Sub-collection Migration");
        console.log("====================================================");

        // Load Env Vars
        dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
        dotenv.config({ path: path.resolve(__dirname, '../.env') });

        // Initialize Admin SDK
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

        // SAFETY: Enforce 'stg' or confirmation for non-staging
        if (!dbId || !dbId.toLowerCase().includes("stg")) {
            console.log("⚠️  WARNING: You are about to run this on a potentially POSITIVE/PRODUCTION database.");
            console.log(`   Current DB: ${dbId || "(default)"}`);
        }

        let db;
        if (dbId) {
            const { getFirestore } = require('firebase-admin/firestore');
            db = getFirestore(dbId);
        } else {
            db = admin.firestore();
        }

        const service = AdminMigrationApi.getInstance(db);

        // Fetch All Teams
        console.log("\n🔍 Fetching all teams...");
        const teamsSnapshot = await db.collection("teams").get();
        const teamIds = teamsSnapshot.docs.map(d => d.id);

        console.log(`Found ${teamIds.length} teams: [${teamIds.join(", ")}]`);

        // Confirmation
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log(`\n⚠️  Ready to migrate service tags for ALL ${teamIds.length} teams.`);
        const answer = await new Promise<string>(resolve => readline.question('Type "yes" to proceed: ', resolve));

        if (answer.toLowerCase() !== 'yes') {
            console.log("❌ Aborted.");
            process.exit(0);
        }

        // Run Loop
        console.log("\n🚀 Starting Migration...");
        for (const teamId of teamIds) {
            await service.migrateServiceTagsToSubcollection(teamId);
        }

        console.log("\n🎉 Service Tags Migration Done!");
        readline.close();
        process.exit(0);

    } catch (error: any) {
        console.error("\n❌ Fatal Error:", error);
        process.exit(1);
    }
})();
