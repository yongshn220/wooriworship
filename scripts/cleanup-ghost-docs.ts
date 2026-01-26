import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Timestamp, Firestore } from 'firebase-admin/firestore';

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

    console.log(`[Ghost Cleanup] Starting for team: ${teamId}`);

    // 1. Fetch V2 Data to reconstruct Legacy IDs
    const schedulesSnap = await db.collection(`teams/${teamId}/serving_schedules`).get();
    const worshipsSnap = await db.collection(`teams/${teamId}/worships`).get();

    const schedules = schedulesSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    const worships = worshipsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

    // Helper to generate Legacy Date IDs (Same as original migration logic)
    const getKey = (timestamp: Timestamp, tags: string[] = []) => {
        const d = timestamp.toDate();
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const sortedTags = (tags || []).sort().filter(t => t);
        return sortedTags.length > 0 ? `${dateStr}_${sortedTags.join('_')}` : dateStr;
    };

    const targetIds = new Set<string>();

    for (const sch of schedules) {
        if (!sch.date) continue;
        const date = sch.date instanceof Timestamp ? sch.date : Timestamp.fromDate(new Date(sch.date));
        targetIds.add(getKey(date, sch.service_tags));
    }
    for (const w of worships) {
        const dVal = w.worship_date || w.date;
        if (!dVal) continue;
        const date = dVal instanceof Timestamp ? dVal : Timestamp.fromDate(new Date(dVal));
        targetIds.add(getKey(date, w.service_tags));
    }

    console.log(`[Ghost Cleanup] Found ${targetIds.size} potential legacy date IDs.`);

    // 2. recursive delete helper
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

    // 3. Iterate and Delete Sub-Collections for these IDs
    let processed = 0;
    const ids = Array.from(targetIds);

    for (const id of ids) {
        const docRef = db.collection(`teams/${teamId}/services`).doc(id);
        const subCols = ['setlists', 'bands', 'flows'];

        // We blindly try to delete these sub-collections for the ID
        for (const sub of subCols) {
            const subPath = `${docRef.path}/${sub}`;
            // Optimization: checking if listCollections includes it is slow for ghosts sometimes, 
            // but deleteCollection handles empty gracefully.
            // However, listCollections IS the way to see ghosts.
            // Let's just try deleting known sub-collection paths.
            await deleteCollection(db, subPath, 100);
        }

        // Also try to delete the doc itself just in case it exists properly
        await docRef.delete();

        processed++;
        if (processed % 10 === 0) console.log(`Processed ${processed}/${ids.length}...`);
    }

    console.log(`[Ghost Cleanup] Finished processing ${processed} legacy IDs.`);
    process.exit(0);
})();
