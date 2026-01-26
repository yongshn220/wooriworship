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

    console.log("[Ghost User Cleanup] Scanning 'users' collection for ghosts...");

    // 1. List ALL document references (including ghosts)
    const userRefs = await db.collection('users').listDocuments();
    console.log(`Total IDs found (including ghosts): ${userRefs.length}`);

    let ghostCount = 0;
    const batch = db.batch();

    // Recursive delete helper
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
            resolve();
            return;
        }

        const batch = db.batch();
        snapshot.docs.forEach((doc: any) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        process.nextTick(() => {
            deleteQueryBatch(db, query, resolve);
        });
    }

    for (const ref of userRefs) {
        const snap = await ref.get();
        if (!snap.exists) {
            console.log(`👻 Found Ghost User ID: ${ref.id}`);

            // Delete sub-collections (RECURSIVE)
            const subCollections = await ref.listCollections();
            for (const subCol of subCollections) {
                console.log(`   -> Deleting hidden sub-collection: ${subCol.id}`);
                await deleteCollection(db, subCol.path, 50);
            }
            // Try deleting the doc ref itself again to be sure
            await ref.delete();
            ghostCount++;
        }
    }

    if (ghostCount === 0) {
        console.log("✅ No ghost users found.");
    } else {
        console.log(`✅ Cleaned up ${ghostCount} ghost users.`);
    }

    process.exit(0);
})();
