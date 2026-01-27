
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
const TARGET_TEAM_ID = 'CeNHlzWOb3QZBqRPE07X';

async function inspectData() {
    console.log(`Inspecting data for Team: ${TARGET_TEAM_ID}...`);

    const servicesRef = db.collection(`teams/${TARGET_TEAM_ID}/services`);
    const snapshot = await servicesRef.get();

    if (snapshot.empty) {
        console.log("No services found in 'services' collection.");
        return;
    }

    console.log(`Found ${snapshot.size} services. Listing first 5:`);
    snapshot.docs.slice(0, 5).forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`Title: ${data.title}`);
        console.log(`Date: ${data.date ? (data.date.toDate ? data.date.toDate().toISOString() : JSON.stringify(data.date)) : 'NULL'}`);
        console.log(`---`);

        // Check sub-collections
        servicesRef.doc(doc.id).collection('setlists').get().then(s => {
            console.log(`  [Sub] setlists count: ${s.size}`);
            s.docs.forEach(sd => console.log(`    - Doc ID: ${sd.id}`));
        });
    });
}

inspectData().catch(console.error);
