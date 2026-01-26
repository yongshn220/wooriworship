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
    const teamId = 'CeNHlzWOb3QZBqRPE07X';

    // Regular expression for Date format YYYY-MM-DD (Legacy IDs)
    const dateRegex = /^\d{4}-\d{2}-\d{2}/;

    console.log(`[Cleanup] Scanning for legacy date-based documents in teams/${teamId}/services...`);

    const services = await db.collection(`teams/${teamId}/services`).get();
    let batch = db.batch();
    let opCount = 0;
    let deletedDocs = 0;

    async function deleteCollection(db: Firestore, collectionPath: string, batchSize: number) {
        const collectionRef = db.collection(collectionPath);
        const query = collectionRef.orderBy('__name__').limit(batchSize);

        return new Promise((resolve, reject) => {
            deleteQueryBatch(db, query, resolve).catch(reject);
        });
    }

    async function deleteQueryBatch(db: Firestore, query: any, resolve: any) {
        const snapshot = await query.get();

        const batchSize = snapshot.size;
        if (batchSize === 0) {
            // When there are no documents left, we are done
            resolve();
            return;
        }

        const batch = db.batch();
        snapshot.docs.forEach((doc: any) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
            deleteQueryBatch(db, query, resolve);
        });
    }

    for (const doc of services.docs) {
        // If ID matches YYYY-MM-DD..., it's legacy
        if (dateRegex.test(doc.id)) {
            console.log(`🗑️ Deleting Legacy Doc: ${doc.id}`);

            // 1. Delete Unknown Sub-Collections (Recursive)
            const subCollections = await doc.ref.listCollections();
            for (const subCol of subCollections) {
                console.log(`   -> Deleting SubCollection: ${subCol.id}`);
                await deleteCollection(db, subCol.path, 100);
            }

            // 2. Delete Parent Doc
            batch.delete(doc.ref);
            opCount++;
            deletedDocs++;

            if (opCount >= 400) {
                await batch.commit();
                batch = db.batch();
                opCount = 0;
            }
        }
    }

    if (opCount > 0) await batch.commit();
    console.log(`[Cleanup] Finished. Deleted ${deletedDocs} legacy date-based services.`);
    process.exit(0);
})();
