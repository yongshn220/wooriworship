
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(
            fs.readFileSync(path.resolve(process.cwd(), './firebase-admin-private-key.json'), 'utf8')
        );
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (e) {
        console.error("Failed to init admin:", e);
        process.exit(1);
    }
}

const db = getFirestore();
const TARGET_TEAM_ID = 'CeNHlzWOb3QZBqRPE07X'; // Hardcode team ID for safety

async function migrateSchedulesToServices() {
    console.log(`Starting Migration for Team: ${TARGET_TEAM_ID}...`);

    const legacyRef = db.collection(`teams/${TARGET_TEAM_ID}/serving_schedules`);
    const servicesRef = db.collection(`teams/${TARGET_TEAM_ID}/services`);

    const snapshot = await legacyRef.get();
    if (snapshot.empty) {
        console.log("No legacy schedules found.");
        return;
    }

    console.log(`Found ${snapshot.size} legacy schedules. Migrating...`);

    let successCount = 0;
    let errorCount = 0;

    for (const doc of snapshot.docs) {
        try {
            const legacyData = doc.data();
            const serviceId = doc.id; // Preserve ID

            // 1. Create Header (services/{id})
            const headerData = {
                id: serviceId,
                teamId: TARGET_TEAM_ID,
                date: legacyData.date, // Timestamp
                title: legacyData.title || (legacyData.date ? new Date(legacyData.date._seconds * 1000).toDateString() : 'Untitled Service'),
                tagId: legacyData.tagId || "", // If exists
                created_at: legacyData.created_at || Timestamp.now(),
                updated_at: Timestamp.now(),
                summary: { songCount: 0 }
            };

            // 2. Prepare Subcollections Data
            const setlistData = { id: 'main', songs: [] }; // Setlist seems missing in legacy 'serving_schedules'
            const flowData = { id: 'main', items: legacyData.items || [] }; // 'items' usually mapping to Flow
            const assigneeData = {
                id: 'main',
                assignee: legacyData.worship_roles || [] // 'worship_roles' -> 'assignee'
            };

            // 3. Batch Write
            const batch = db.batch();
            const newServiceRef = servicesRef.doc(serviceId);

            batch.set(newServiceRef, headerData);
            batch.set(newServiceRef.collection('setlists').doc('main'), setlistData);
            batch.set(newServiceRef.collection('praise_assignee').doc('main'), assigneeData);
            batch.set(newServiceRef.collection('flows').doc('main'), flowData);

            await batch.commit();
            console.log(`Migrated Service: ${serviceId}`);
            successCount++;

        } catch (error) {
            console.error(`Failed to migrate service: ${doc.id}`, error);
            errorCount++;
        }
    }

    console.log(`\nMigration Completed.`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
}

migrateSchedulesToServices().catch(console.error);
