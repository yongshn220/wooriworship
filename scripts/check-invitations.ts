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

    console.log("--- Checking Invitations Location ---");

    // 1. Check Root Collection
    const rootInvs = await db.collection('invitations').get();
    console.log(`[ROOT] invitations: ${rootInvs.size} docs`);
    if (!rootInvs.empty) {
        console.log(`   Sample: ${JSON.stringify(rootInvs.docs[0].data()).substring(0, 100)}...`);
    }

    // 2. Check Team Sub-Collection
    const teamInvs = await db.collection(`teams/${teamId}/invitations`).get();
    console.log(`[TEAM] teams/${teamId}/invitations: ${teamInvs.size} docs`);
    if (!teamInvs.empty) {
        console.log(`   Sample: ${JSON.stringify(teamInvs.docs[0].data()).substring(0, 100)}...`);
    } else {
        console.log("   ❌ Team sub-collection is empty.");
    }

    process.exit(0);
})();
