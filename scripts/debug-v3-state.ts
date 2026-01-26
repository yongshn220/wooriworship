
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config({ path: '.env.local' });

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

async function debugState() {
    const teamId = 'CeNHlzWOb3QZBqRPE07X';
    console.log(`Debugging Team: ${teamId}`);

    // 1. Check Team Sub-collections
    console.log('--- Team Sub-collections ---');
    const teamRef = db.collection('teams').doc(teamId);
    const teamCols = await teamRef.listCollections();
    teamCols.forEach(c => console.log(` - ${c.id}`));

    // 2. Check Services Sub-collections
    console.log('--- Searching for Praise Assignee in first 50 services ---');
    const servicesSnapshot = await teamRef.collection('services').limit(50).get();
    let found = false;
    for (const doc of servicesSnapshot.docs) {
        const subCols = await doc.ref.listCollections();
        const assigneeCol = subCols.find(c => c.id === 'praise_assignee');
        if (assigneeCol) {
            console.log(`Service found with praise_assignee: ${doc.id}`);
            const snap = await assigneeCol.get();
            if (!snap.empty) {
                console.log(` -> Found ${snap.size} docs`);
                const data = snap.docs[0].data();
                console.log(` -> Sample doc keys: ${Object.keys(data).join(', ')}`);
                if (data.assignee) console.log(` -> Verified 'assignee' field exists!`);
                else console.log(` -> WARNING: 'assignee' field MISSING! Keys: ${Object.keys(data)}`);
                found = true;
                break;
            }
        }
    }
    if (!found) console.log('No service with praise_assignee found in sample.');
}

debugState().catch(console.error);
