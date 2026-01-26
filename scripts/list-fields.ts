import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

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
    const schedules = await db.collection(`teams/${teamId}/serving_schedules`).get();
    const allKeys = new Set();
    schedules.forEach(d => {
        Object.keys(d.data()).forEach(k => allKeys.add(k));
    });
    console.log("All fields in serving_schedules:", Array.from(allKeys));

    // Check worships too
    const worships = await db.collection(`teams/${teamId}/worships`).get();
    const wKeys = new Set();
    worships.forEach(d => {
        Object.keys(d.data()).forEach(k => wKeys.add(k));
    });
    console.log("All fields in worships:", Array.from(wKeys));

    process.exit(0);
})();
