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

    // 1. Check Root Document (Should be lightweight)
    const snapshot = await db.collection(`teams/${teamId}/services`).limit(1).get();
    if (snapshot.empty) {
        console.log("No services found.");
        process.exit(0);
    }
    const doc = snapshot.docs[0];
    console.log("--- Root Document (Should NOT have setlist/bands/flows fields) ---");
    console.log(JSON.stringify({ id: doc.id, ...doc.data() }, null, 2));

    // 3. Find check for bands
    console.log("\n--- Searching for Bands ---");
    const services = await db.collection(`teams/${teamId}/services`).get();
    for (const sDoc of services.docs) {
        const bandSnap = await sDoc.ref.collection('bands').get();
        if (!bandSnap.empty) {
            console.log(`Found Bands in Service: ${sDoc.id}`);
            console.log(JSON.stringify(bandSnap.docs[0].data(), null, 2));
            break;
        }
    }

    process.exit(0);
})();
