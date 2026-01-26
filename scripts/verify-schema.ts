import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Timestamp } from 'firebase-admin/firestore';

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
    const db = getFirestore(dbId);
    const teamId = 'CeNHlzWOb3QZBqRPE07X';

    console.log("--- Verifying Random ID & Tag Schema ---");
    const snapshot = await db.collection(`teams/${teamId}/services`).limit(1).get();

    if (snapshot.empty) {
        console.log("No services found.");
        process.exit(0);
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // 1. Verify Random ID
    const isDateId = /^\d{4}-\d{2}-\d{2}/.test(doc.id);
    console.log(`\n1. ID Check: ${doc.id}`);
    console.log(isDateId ? "❌ ID looks like a date (Failed)" : "✅ ID is random string (Pass)");

    // 2. Verify Tag Optimization
    console.log(`\n2. Tag Schema Check`);
    if (data.tagId !== undefined) {
        console.log(`✅ 'tagId' exists: ${JSON.stringify(data.tagId)}`);
    } else {
        console.log("❌ 'tagId' MISSING");
    }

    if (data.service_tags === undefined) {
        console.log("✅ 'service_tags' array removed.");
    } else {
        console.log("⚠️ 'service_tags' array still exists.");
    }

    process.exit(0);
})();
