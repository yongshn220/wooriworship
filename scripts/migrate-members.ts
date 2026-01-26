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

    console.log(`[Member Migration] Populating teams/${teamId}/members...`);

    // 1. Gather all unique IDs from service bands
    const services = await db.collection(`teams/${teamId}/services`).get();
    const uniqueMembers = new Set<string>();
    const processingMap = new Map<string, { positions: Set<string> }>();

    console.log(`Scanning ${services.size} services for members...`);

    let serviceCount = 0;
    for (const doc of services.docs) {
        serviceCount++;
        const bands = await doc.ref.collection('bands').get();
        bands.docs.forEach(b => {
            const roles = b.data().worship_roles || [];
            roles.forEach((r: any) => {
                if (r.memberIds && Array.isArray(r.memberIds)) {
                    r.memberIds.forEach((mid: string) => {
                        uniqueMembers.add(mid);

                        // Determine position/role
                        if (!processingMap.has(mid)) {
                            processingMap.set(mid, { positions: new Set() });
                        }
                        // Try to map roleId to role name if possible? 
                        // For now, we don't have role names handy easily without querying band_roles.
                        // We will skip positions inference for this MV migration.
                    });
                }
            });
        });
        if (serviceCount % 50 === 0) console.log(`Scanned ${serviceCount} services...`);
    }

    console.log(`Found ${uniqueMembers.size} unique members.`);
    let batch = db.batch();
    let opCount = 0;

    for (const mid of Array.from(uniqueMembers)) {
        // Check if User
        const userDoc = await db.collection('users').doc(mid).get();
        const isUser = userDoc.exists;
        const userData = isUser ? userDoc.data() : null;

        const memberRef = db.collection(`teams/${teamId}/members`).doc(mid);

        const memberData = {
            id: mid,
            type: isUser ? 'USER' : 'GUEST',
            displayName: isUser ? (userData?.name || 'Unknown User') : mid, // For guest, key is often the name
            userId: isUser ? mid : null,
            avatarUrl: isUser ? (userData?.photo_url || null) : null,
            positions: [], // TODO: Infer later
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        };

        batch.set(memberRef, memberData, { merge: true });
        opCount++;

        if (opCount >= 400) {
            await batch.commit();
            batch = db.batch();
            opCount = 0;
        }
    }

    if (opCount > 0) await batch.commit();
    console.log(`✅ Successfully migrated ${uniqueMembers.size} members.`);
    process.exit(0);
})();
