import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Firestore } from 'firebase-admin/firestore';

(async () => {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
    const serviceAccount = require(path.resolve(process.cwd(), 'firebase-admin-private-key.json'));
    const dbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    const { getFirestore } = require('firebase-admin/firestore');
    const db: Firestore = getFirestore(dbId);
    const teamId = 'CeNHlzWOb3QZBqRPE07X';

    console.log(`[Collection Migration] Starting for team: ${teamId}`);

    // Map: [Legacy Collection] -> [New Collection]
    const MIGRATION_MAP = [
        { from: 'serving_roles', to: 'band_roles' },
        { from: 'serving_templates', to: 'service_flow_templates' }
    ];

    for (const { from, to } of MIGRATION_MAP) {
        console.log(`\n🚀 Migrating ${from} -> ${to}...`);

        const fromPath = `teams/${teamId}/${from}`;
        const toPath = `teams/${teamId}/${to}`;

        const snapshot = await db.collection(fromPath).get();

        if (snapshot.empty) {
            console.log(`⚠️  Source collection ${from} is empty. Skipping.`);
            continue;
        }

        console.log(`found ${snapshot.size} documents.`);
        const batch = db.batch();
        let ops = 0;

        // 1. Copy to new location
        for (const doc of snapshot.docs) {
            const newRef = db.collection(toPath).doc(doc.id);
            // Copy data exactly as is (no transformation needed for now)
            batch.set(newRef, doc.data());

            // 2. Delete old document
            batch.delete(doc.ref);
            ops++;
        }

        await batch.commit();
        console.log(`✅ Moved ${ops} documents to ${to}.`);
    }

    console.log(`\n🎉 Collection Migration Completed!`);
    process.exit(0);
})();
