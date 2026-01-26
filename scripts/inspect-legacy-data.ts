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

    console.log("--- worships ---");
    const worships = await db.collection(`teams/${teamId}/worships`).limit(3).get();
    worships.forEach(d => {
        const data = d.data();
        console.log(`ID: ${d.id}, Date: ${JSON.stringify(data.worship_date || data.date)}, Tags: ${JSON.stringify(data.service_tags)}`);
    });

    console.log("\n--- serving_schedules ---");
    const schedules = await db.collection(`teams/${teamId}/serving_schedules`).limit(3).get();
    schedules.forEach(d => {
        const data = d.data();
        console.log(`ID: ${d.id}, Date: ${JSON.stringify(data.date)}, Tags: ${JSON.stringify(data.service_tags)}`);
    });

    process.exit(0);
})();
