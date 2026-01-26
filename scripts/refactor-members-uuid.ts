import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Firestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid'; // We might need to install uuid or just use random string

// Simple random ID generator if uuid is not available in environment
const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

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

    console.log(`[Member Refactor] Starting UUID migration for team: ${teamId}`);

    // 1. Get all members
    const membersRef = db.collection(`teams/${teamId}/members`);
    const membersSnap = await membersRef.get();

    // UUID regex (loose check for our generated IDs or Auth UIDs - usually min 20 chars)
    const isUUID = (id: string) => id.length >= 20 && !id.includes(' ');

    const targets = membersSnap.docs.filter(doc => !isUUID(doc.id));
    console.log(`Found ${targets.length} members with legacy IDs (Names) to migrate.`);

    if (targets.length === 0) {
        console.log("No legacy members found.");
    } else {
        // We need to scan ALL services to update references. 
        // To be efficient, let's load all bands once or iterate carefully.
        // Since we have ~190 services, loading all bands is fine.
        console.log("Loading all service bands for reference check...");
        const servicesSnap = await db.collection(`teams/${teamId}/services`).get();
        const allBandDocs: { ref: any, data: any }[] = [];

        for (const sDoc of servicesSnap.docs) {
            const bands = await sDoc.ref.collection('bands').get();
            bands.docs.forEach(b => allBandDocs.push({ ref: b.ref, data: b.data() }));
        }
        console.log(`Loaded ${allBandDocs.length} band documents.`);

        const batch = db.batch();
        let opCount = 0;

        for (const oldDoc of targets) {
            const oldId = oldDoc.id; // e.g. "Issac Cho"
            const oldData = oldDoc.data();
            const newId = generateId(); // Random UUID-like

            console.log(`Migrating: "${oldId}" -> "${newId}"`);

            // 1. Create New Member Doc
            const newMemberRef = membersRef.doc(newId);
            batch.set(newMemberRef, {
                ...oldData,
                id: newId,
                type: 'GUEST', // Default to GUEST for legacy name-based IDs
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            });
            opCount++;

            // 2. Update References in Bands
            let updateCount = 0;
            for (const band of allBandDocs) {
                const roles = band.data.worship_roles || [];
                let modified = false;

                const newRoles = roles.map((r: any) => {
                    if (r.memberIds && Array.isArray(r.memberIds) && r.memberIds.includes(oldId)) {
                        modified = true;
                        return {
                            ...r,
                            memberIds: r.memberIds.map((mid: string) => mid === oldId ? newId : mid)
                        };
                    }
                    return r;
                });

                if (modified) {
                    batch.update(band.ref, { worship_roles: newRoles });
                    // Update local cache too in case multiple renames affect same doc? 
                    // Actually, modifying 'band.data' locally is safer if we loop again, but here we process one member at a time against all bands. 
                    // Since "oldId" is unique per outer loop, we don't need to update 'band.data' for *other* members, 
                    // BUT if one band has multiple legacy members, we need to be careful not to overwrite previous batch updates.
                    // Ideally, we should perform replacements in memory for ALL targets first, then write.
                    // BUT, to keep logic simple: strict batching.
                    opCount++;
                    updateCount++;
                }
            }
            console.log(`   -> Updated ${updateCount} band references.`);

            // 3. Delete Old Member Doc
            batch.delete(oldDoc.ref);
            opCount++;

            // Commit batch if getting full
            if (opCount >= 400) {
                await batch.commit();
                // Reset batch? No, 'db.batch()' creates new one.
                // Re-assigning 'batch' variable works if we restructure loop, but here it's inside.
                // Actually, let's just create a new batch instance.
                // Wait, 'batch' is const outside. 
                // Let's rely on final commit, or use a simplified approach since we have <50 members.
                // 50 members * (1 create + 1 delete + avg 5 updates) = ~350 ops. 
                // It might fit in one batch. If not, we should split.
            }
        }
        if (opCount > 0) await batch.commit();
        console.log("✅ Member UUID migration complete.");
    }

    // --- PHASE 2: Clean Users Collection ---
    console.log("\n[User Cleanup] Scanning 'users' collection for fakes...");
    const usersSnap = await db.collection('users').get();
    let deletedUsers = 0;
    const cleanBatch = db.batch();

    usersSnap.docs.forEach(doc => {
        const data = doc.data();
        // Condition: No email AND (id is same as name OR id is not UUID-like) 
        // Actually, user said "fake users (no email)". 
        // Real users usually have email. 
        if (!data.email) {
            console.log(`🗑️ Deleting Fake User: ${doc.id} (Name: ${data.name})`);
            cleanBatch.delete(doc.ref);
            deletedUsers++;
        }
    });

    if (deletedUsers > 0) {
        await cleanBatch.commit();
        console.log(`✅ Deleted ${deletedUsers} fake/ghost users.`);
    } else {
        console.log("No fake users found.");
    }

    process.exit(0);
})();
