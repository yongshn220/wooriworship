/**
 * Backfill date_string for all existing services.
 * Uses Firebase Client SDK with email/password auth.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/backfill-date-string.ts
 *
 * You will be prompted for email and password.
 */

import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, initializeFirestore, collection, getDocs, writeBatch, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const dbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;
const db = (dbId && dbId !== "(default)")
    ? initializeFirestore(app, {}, dbId)
    : getFirestore(app);

// All services were created in New York
const CREATOR_TIMEZONE = 'America/New_York';

function timestampToDateString(timestamp: Timestamp): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: CREATOR_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(timestamp.toDate());
}

function prompt(question: string, hidden = false): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        if (hidden) {
            process.stdout.write(question);
            const stdin = process.stdin;
            const wasRaw = stdin.isRaw;
            if (stdin.isTTY) stdin.setRawMode(true);

            let input = '';
            const onData = (ch: Buffer) => {
                const c = ch.toString('utf8');
                if (c === '\n' || c === '\r') {
                    stdin.removeListener('data', onData);
                    if (stdin.isTTY) stdin.setRawMode(wasRaw ?? false);
                    process.stdout.write('\n');
                    rl.close();
                    resolve(input);
                } else if (c === '\u0003') {
                    process.exit();
                } else if (c === '\u007F' || c === '\b') {
                    input = input.slice(0, -1);
                } else {
                    input += c;
                }
            };
            stdin.on('data', onData);
        } else {
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer);
            });
        }
    });
}

async function main() {
    console.log('=== Backfill date_string ===');
    console.log(`Project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
    console.log(`Timezone: ${CREATOR_TIMEZONE}`);
    console.log('');

    // Auth
    const email = await prompt('Email: ');
    const password = await prompt('Password: ', true);

    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        console.log(`\nLogged in as: ${cred.user.email}`);
    } catch (e: any) {
        console.error(`Login failed: ${e.message}`);
        process.exit(1);
    }

    // Backfill
    const teamsSnap = await getDocs(collection(db, 'teams'));
    console.log(`\nFound ${teamsSnap.size} teams`);

    let totalUpdated = 0;
    let totalSkipped = 0;

    for (const teamDoc of teamsSnap.docs) {
        const teamId = teamDoc.id;
        const servicesSnap = await getDocs(collection(db, `teams/${teamId}/services`));
        if (servicesSnap.empty) continue;

        console.log(`\nTeam ${teamId}: ${servicesSnap.size} services`);

        const batch = writeBatch(db);
        let batchCount = 0;

        for (const serviceDoc of servicesSnap.docs) {
            const data = serviceDoc.data();

            if (data.date_string) {
                totalSkipped++;
                continue;
            }

            if (!data.date) {
                console.log(`  [SKIP] ${serviceDoc.id} — no date`);
                totalSkipped++;
                continue;
            }

            const dateString = timestampToDateString(data.date as Timestamp);
            console.log(`  ${serviceDoc.id}: ${(data.date as Timestamp).toDate().toISOString()} → ${dateString} (${data.title || 'untitled'})`);

            batch.update(serviceDoc.ref, { date_string: dateString });
            batchCount++;

            if (batchCount >= 400) {
                await batch.commit();
                console.log(`  Committed ${batchCount}`);
                totalUpdated += batchCount;
                batchCount = 0;
            }
        }

        if (batchCount > 0) {
            await batch.commit();
            totalUpdated += batchCount;
            console.log(`  Committed ${batchCount}`);
        }
    }

    console.log('\n=== Done ===');
    console.log(`Updated: ${totalUpdated}`);
    console.log(`Skipped: ${totalSkipped}`);
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
