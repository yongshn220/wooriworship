import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

(async () => {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
    const serviceAccount = require(path.resolve(process.cwd(), 'firebase-admin-private-key.json'));
    const dbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;

    console.log(`Connecting to DB: ${dbId}`);

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    const { getFirestore } = require('firebase-admin/firestore');
    const db = getFirestore(dbId);

    const teamId = 'CeNHlzWOb3QZBqRPE07X'; // Main dev team
    const collectionPath = `teams/${teamId}/services`;

    console.log(`\nChecking Collection: ${collectionPath}`);
    const snapshot = await db.collection(collectionPath).get();

    console.log(`Total Service Docs: ${snapshot.size}`);

    if (snapshot.empty) {
        console.log("❌ No service documents found.");
        process.exit(0);
    }

    let setlistCount = 0;
    let bandCount = 0;
    let flowCount = 0;

    console.log("\nSample Checks (First 5):");

    console.log("\n--- Scanning for ANY document with 'bands' sub-collection ---");
    let foundBandDoc = null;

    // We already have all docs in snapshot
    for (const doc of snapshot.docs) {
        const collections = await doc.ref.listCollections();
        const colIds = collections.map(c => c.id);
        if (colIds.includes('bands')) {
            foundBandDoc = doc.id;
            console.log(`✅ Found 'bands' in Doc ID: ${doc.id}`);
            const bands = await doc.ref.collection('bands').get();
            console.log(`   -> Contains ${bands.size} documents.`);
            break; // Stop after finding one
        }
    }

    if (!foundBandDoc) {
        console.log("❌ No service with 'bands' sub-collection found in ALL 190 docs.");
    }

    // Explicit check for known ID
    const knownId = '2025-12-12';
    console.log(`\n--- Explicit Check for ID: ${knownId} ---`);
    const knownDoc = await db.collection(collectionPath).doc(knownId).get();
    if (knownDoc.exists) {
        const kCols = await knownDoc.ref.listCollections();
        console.log(`Sub-Collections for ${knownId}: [${kCols.map((c: any) => c.id).join(', ')}]`);
    } else {
        console.log(`Doc ${knownId} does not exist.`);
    }


    console.log("\n-------------------------------------------");
    console.log("Summary of First 5:");
    console.log(`Setlists found: ${setlistCount}`);
    console.log(`Bands found: ${bandCount}`);
    console.log(`Flows found: ${flowCount}`);

    process.exit(0);
})();
