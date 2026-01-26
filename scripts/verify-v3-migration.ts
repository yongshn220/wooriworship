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
    const snapshot = await db.collection(`teams/${teamId}/services`).get();

    console.log(`Total services migrated: ${snapshot.size}`);

    let bandCount = 0;
    let flowCount = 0;
    let sample = null;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.bands) bandCount++;
        if (data.flows) flowCount++;
        if (!sample && (data.bands || data.flows)) {
            sample = { id: doc.id, ...data };
        }
    }

    console.log(`Services with Bands: ${bandCount}`);
    console.log(`Services with Flows: ${flowCount}`);

    if (sample) {
        console.log("Sample Document with Details:");
        console.log(JSON.stringify(sample, null, 2));
    } else {
        console.log("No detailed services found among the first batch.");
    }
    process.exit(0);
})();
