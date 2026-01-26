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

    // We only migrate for the development team for now, or we can scan all.
    // Assuming team_id is in the document.
    const teamId = 'CeNHlzWOb3QZBqRPE07X';

    console.log(`[Invitation Migration] Scanning Root 'invitations'...`);

    const snapshot = await db.collection('invitations').where('team_id', '==', teamId).get();

    if (snapshot.empty) {
        console.log("No root invitations found for this team.");
        process.exit(0);
    }

    console.log(`Found ${snapshot.size} invitations to migrate.`);
    const batch = db.batch();
    let ops = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const newRef = db.collection(`teams/${teamId}/invitations`).doc(doc.id);

        batch.set(newRef, data); // Copy
        batch.delete(doc.ref);   // Delete original (Move)
        ops++;
    }

    await batch.commit();
    console.log(`✅ Successfully moved ${ops} invitation documents to teams/${teamId}/invitations.`);
    process.exit(0);
})();
