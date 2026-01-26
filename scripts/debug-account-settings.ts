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

    console.log("--- Inspecting Account Settings ---");
    const snapshot = await db.collection('account_settings').limit(5).get();

    if (snapshot.empty) {
        console.log("No account_settings found.");
        process.exit(0);
    }

    snapshot.docs.forEach(doc => {
        console.log(`Doc ID: ${doc.id}`);
        const data = doc.data();
        console.log(` - uid: ${data.uid}`);
        console.log(` - keys: ${Object.keys(data).join(', ')}`);
    });

    process.exit(0);
})();
