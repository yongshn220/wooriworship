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

    console.log(`[Member Debug] Scanning bands in team ${teamId}...`);

    // Scan services for bands
    const services = await db.collection(`teams/${teamId}/services`).limit(20).get();
    const uniqueMembers = new Set<string>();

    for (const doc of services.docs) {
        const bands = await doc.ref.collection('bands').get();
        bands.docs.forEach(b => {
            const roles = b.data().worship_roles || [];
            roles.forEach((r: any) => {
                if (r.memberIds && Array.isArray(r.memberIds)) {
                    r.memberIds.forEach((mid: string) => uniqueMembers.add(mid));
                }
            });
        });
    }

    console.log(`Found ${uniqueMembers.size} unique member IDs in sample.`);

    // Check if these are Users
    const memberAnalysis = [];
    for (const uid of Array.from(uniqueMembers).slice(0, 10)) {
        const userDoc = await db.collection('users').doc(uid).get();
        memberAnalysis.push({
            id: uid,
            isUser: userDoc.exists,
            userData: userDoc.exists ? userDoc.data() : null
        });
    }

    console.log(JSON.stringify(memberAnalysis, null, 2));
    process.exit(0);
})();
