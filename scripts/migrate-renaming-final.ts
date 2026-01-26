
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(
        fs.readFileSync(path.resolve(process.cwd(), './firebase-admin-private-key.json'), 'utf8')
    );
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const dbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;
const db = getFirestore(dbId);

async function migrateRenamingFinal() {
    const teamId = 'CeNHlzWOb3QZBqRPE07X'; // Target team
    console.log(`Starting Final Renaming Migration for Team: ${teamId}...`);

    // 1. Rename 'band_roles' -> 'praise_team_roles'
    await renameCollection(
        `teams/${teamId}/band_roles`,
        `teams/${teamId}/praise_team_roles`,
        false // Don't modify content, just move. Actually we might need to if fields changed, but roles usually don't have 'worship_roles' field.
    );

    // 2. Rename 'bands' sub-collections -> 'praise_assignee' AND rename field 'worship_roles' -> 'assignee'
    const servicesRef = db.collection(`teams/${teamId}/services`);
    const servicesSnapshot = await servicesRef.get();

    let serviceCount = 0;
    for (const serviceDoc of servicesSnapshot.docs) {
        const serviceId = serviceDoc.id;
        const oldBandsRef = servicesRef.doc(serviceId).collection('bands');
        const newAssigneeRef = servicesRef.doc(serviceId).collection('praise_assignee');

        const bandsSnapshot = await oldBandsRef.get();
        if (bandsSnapshot.empty) continue;

        console.log(`Migrating service ${serviceId}: ${bandsSnapshot.size} band docs...`);
        const batch = db.batch();

        for (const bandDoc of bandsSnapshot.docs) {
            const data = bandDoc.data();
            const newDocRef = newAssigneeRef.doc(bandDoc.id);

            // Transform field: worship_roles -> assignee
            const newData = { ...data };
            if (newData.worship_roles) {
                newData.assignee = newData.worship_roles;
                delete newData.worship_roles;
            }

            batch.set(newDocRef, newData);
            batch.delete(bandDoc.ref); // Delete old doc
        }

        await batch.commit();
        serviceCount++;
    }
    console.log(`Migrated bands for ${serviceCount} services.`);

    // 3. Cleanup Legacy Ghost Collections (if strictly separate)
    // Note: 'serving_roles' and 'serving_templates' should have been handled by migrate-legacy-collections.ts
    // We can double check 'serving_schedules' and delete if exists?
    await deleteCollectionIfExists('serving_schedules');
    await deleteCollectionIfExists('serving_roles'); // double check
    await deleteCollectionIfExists('serving_templates'); // double check

    console.log('Final Renaming Migration Completed.');
}

async function renameCollection(oldPath: string, newPath: string, transformFields: boolean = false) {
    const oldRef = db.collection(oldPath);
    const newRef = db.collection(newPath);
    const snapshot = await oldRef.get();

    if (snapshot.empty) {
        console.log(`No documents found in ${oldPath}`);
        return;
    }

    console.log(`Renaming ${oldPath} -> ${newPath} (${snapshot.size} docs)...`);
    const batch = db.batch();

    for (const doc of snapshot.docs) {
        const data = doc.data();
        // Assuming simple copy for now unless transform needed
        batch.set(newRef.doc(doc.id), data);
        batch.delete(doc.ref);
    }

    await batch.commit();
    console.log(`Renamed ${oldPath} to ${newPath}`);
}

async function deleteCollectionIfExists(path: string) {
    const ref = db.collection(path);
    const snapshot = await ref.limit(10).get();
    if (!snapshot.empty) {
        console.log(`Deleting legacy collection: ${path}`);
        await recursiveDelete(ref);
    }
}

async function recursiveDelete(ref: FirebaseFirestore.CollectionReference | FirebaseFirestore.Query) {
    const snapshot = await ref.get();
    if (snapshot.empty) return;

    const batch = db.batch();
    for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
    }
    await batch.commit();
    // Simple non-recursive for these specifically known flat collections, 
    // but if full recursive needed use firebase-tools or recursive logic.
    // For this task, assuming flat legacy collections.
}

migrateRenamingFinal().catch(console.error);
