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

    console.log(`[Account Migration] Moving 'account_settings' to 'users/{uid}/settings/preference'...`);

    // 1. Get all account_settings
    const snapshot = await db.collection('account_settings').get();

    if (snapshot.empty) {
        console.log("No account_settings found.");
        process.exit(0);
    }

    console.log(`Found ${snapshot.size} settings docs.`);
    const batch = db.batch();
    let ops = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const uid = data.uid;

        if (!uid) {
            console.warn(`⚠️  Doc ${doc.id} missing 'uid'. Skipping.`);
            continue;
        }

        // New Path: users/{uid}/settings/preference
        const newRef = db.collection('users').doc(uid).collection('settings').doc('preference');

        batch.set(newRef, data); // Copy
        batch.delete(doc.ref);   // Delete original
        ops++;
    }

    await batch.commit();
    console.log(`✅ Moved ${ops} account settings.`);
    process.exit(0);
})();
