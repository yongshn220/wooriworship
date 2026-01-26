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

    console.log("--- Checking for potentially fake users in 'users' collection ---");

    // Scan users for non-standard IDs or missing auth fields
    const snapshot = await db.collection('users').get();

    let suspectCount = 0;
    console.log(`Total documents in 'users': ${snapshot.size}`);

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        // A real user usually has an email and UID matching Doc ID.
        // A "Custom Name" inserted as a user might lack email or have weird ID.
        const looksLikeFake = !data.email && !data.uid;

        if (looksLikeFake || doc.id.length < 20 || doc.id.includes(' ')) {
            console.log(`[Suspect] ID: "${doc.id}", Name: "${data.name || 'N/A'}", Email: ${data.email}`);
            suspectCount++;
        }
    });

    if (suspectCount === 0) {
        console.log("✅ No suspicious 'fake users' found in the root 'users' collection.");
    } else {
        console.log(`⚠️ Found ${suspectCount} suspicious documents in 'users'.`);
    }

    process.exit(0);
})();
