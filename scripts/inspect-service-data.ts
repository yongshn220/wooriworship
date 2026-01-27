
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getFirestore } from 'firebase-admin/firestore';

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


async function inspectServiceData() {
    const teamId = 'CeNHlzWOb3QZBqRPE07X'; // Target team
    console.log(`Inspecting Team Doc: ${teamId}...`);

    const teamRef = db.doc(`teams/${teamId}`);
    const teamSnap = await teamRef.get();

    if (!teamSnap.exists) {
        console.log("Team document DOES NOT EXIST!");
        return;
    }
    console.log("Team document exists.");
    const teamSubcols = await teamRef.listCollections();
    console.log(`Team Subcollections: ${teamSubcols.map(c => c.id).join(', ')}`);


    const servingSchedulesRef = db.collection(`teams/${teamId}/serving_schedules`);
    const schedulesSnapshot = await servingSchedulesRef.limit(3).get();

    if (schedulesSnapshot.empty) {
        console.log("No docs found in 'serving_schedules' either.");
        return;
    }

    console.log(`Found ${schedulesSnapshot.size} docs in 'serving_schedules'. Inspecting first one...`);
    const schedDoc = schedulesSnapshot.docs[0];
    console.log(`\n=== Schedule ID: ${schedDoc.id} ===`);
    console.log(JSON.stringify(schedDoc.data(), null, 2));

    // Check subcols
    const subcols = await schedDoc.ref.listCollections();
    console.log(`\nSubcollections: ${subcols.map(c => c.id).join(', ')}`);
}

inspectServiceData().catch(console.error);
