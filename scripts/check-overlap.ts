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

    const { getFirestore, Timestamp } = require('firebase-admin/firestore');
    const db = getFirestore(dbId);

    const teamId = 'CeNHlzWOb3QZBqRPE07X';

    const worships = await db.collection(`teams/${teamId}/worships`).get();
    const schedules = await db.collection(`teams/${teamId}/serving_schedules`).get();

    const wDates = worships.docs.map(d => {
        const date = d.data().worship_date || d.data().date;
        return date.toDate().toISOString().split('T')[0];
    });

    const sDates = schedules.docs.map(d => {
        const date = d.data().date;
        return date.toDate().toISOString().split('T')[0];
    });

    const intersect = wDates.filter(d => sDates.includes(d));
    console.log(`Worship Dates: ${wDates.length}, Schedule Dates: ${sDates.length}`);
    console.log(`Overlapping Dates (ISO prefix): ${intersect.length}`);
    console.log(`Sample Overlap: ${intersect.slice(0, 5)}`);

    process.exit(0);
})();
