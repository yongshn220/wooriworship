import { db } from "@/firebase";
import { collection, getDocs, doc, writeBatch, Timestamp, runTransaction, DocumentData, query, limit } from "firebase/firestore";
import { parseLocalDate, timestampToDateString } from "@/components/util/helper/helper-functions";

class MigrationService {
    private static instance: MigrationService;
    // ... (skip unchanged parts) ...

    // =========================================================================================
    // Phase 3: Cleanup (Destructive)
    // =========================================================================================

    // ... (existing methods)

    // Helper method (private) removed from here? No, it's just brace issue.

    private constructor() { }

    public static getInstance(): MigrationService {
        if (!MigrationService.instance) {
            MigrationService.instance = new MigrationService();
        }
        return MigrationService.instance;
    }

    /**
     * Executes the full migration process in sequence.
     * 1. Schema Enrichment (Pre-processing)
     * 2. Structural Migration (Deep Copy)
     */
    async runFullMigration(onProgress: (log: string) => void): Promise<boolean> {
        try {
            onProgress("Starting Full Migration...");

            // --- Phase 1: Schema Enrichment ---
            onProgress("[Phase 1] Schema Enrichment started.");

            onProgress("1-1. Normalizing Timestamps...");
            await this.normalizeTimestamps();

            onProgress("1-2. Generating Correlation Keys & Linking...");
            await this.generateCorrelationKeys();

            onProgress("1-3. Indexing Serving Participants...");
            await this.indexServingParticipants();

            onProgress("[Phase 1] Completed.");

            // --- Phase 2: Structural Migration ---
            onProgress("[Phase 2] Structural Migration (Deep Copy) started.");

            onProgress("2-1. Migrating Teams & Members...");
            await this.migrateTeamsAndMembers();

            onProgress("2-2. Migrating Sub-collections (Worships, Songs, Notices)...");
            await this.migrateSubCollections();

            onProgress("2-3. Migrating Tags...");
            await this.migrateTags();

            onProgress("[Phase 2] Completed.");
            onProgress("Migration Successfully Finished!");
            return true;
        } catch (e: any) {
            onProgress(`[ERROR] Migration Failed: ${e.message}`);
            console.error(e);
            return false;
        }
    }

    // =========================================================================================
    // Phase 1: Schema Enrichment (Pre-processing)
    // =========================================================================================

    private async normalizeTimestamps() {
        const teamsSnapshot = await getDocs(collection(db, "teams"));

        // 1. Normalize ServingSchedule.date
        for (const teamDoc of teamsSnapshot.docs) {
            const schedulesSnapshot = await getDocs(collection(db, "teams", teamDoc.id, "serving_schedules"));
            const batch = writeBatch(db);
            let operationCount = 0;

            for (const docSnapshot of schedulesSnapshot.docs) {
                const data = docSnapshot.data();
                if (!data.date) continue;

                let newTimestamp: Timestamp | null = null;
                if (typeof data.date === 'string') {
                    const d = parseLocalDate(data.date);
                    d.setHours(12, 0, 0, 0);
                    newTimestamp = Timestamp.fromDate(d);
                } else if (data.date instanceof Timestamp) {
                    // Force normalize time to 12:00
                    const d = data.date.toDate();
                    d.setHours(12, 0, 0, 0);
                    newTimestamp = Timestamp.fromDate(d);
                } else if (data.date.seconds) {
                    // Handle raw object case if necessary
                    const d = new Date(data.date.seconds * 1000);
                    d.setHours(12, 0, 0, 0);
                    newTimestamp = Timestamp.fromDate(d);
                }

                if (newTimestamp) {
                    batch.update(docSnapshot.ref, { date: newTimestamp });
                    operationCount++;
                }
            }
            if (operationCount > 0) await batch.commit();
        }

        // 2. Normalize Worship.worship_date (Root Collection)
        const worshipsSnapshot = await getDocs(collection(db, "worships"));
        const wBatch = writeBatch(db);
        let wCount = 0;

        for (const docSnapshot of worshipsSnapshot.docs) {
            const data = docSnapshot.data();
            if (!data.worship_date) continue;

            let newTimestamp: Timestamp | null = null;
            // Logic repeated for safety
            if (typeof data.worship_date === 'string') {
                const d = new Date(data.worship_date);
                d.setHours(12, 0, 0, 0);
                newTimestamp = Timestamp.fromDate(d);
            } else if (data.worship_date instanceof Timestamp) {
                const d = data.worship_date.toDate();
                d.setHours(12, 0, 0, 0);
                newTimestamp = Timestamp.fromDate(d);
            }

            if (newTimestamp) {
                wBatch.update(docSnapshot.ref, { worship_date: newTimestamp });
                wCount++;
            }
        }
        if (wCount > 0) await wBatch.commit();
    }

    private async generateCorrelationKeys() {
        // TODO: Generate ${date}_${tag} keys for Worships and ServingSchedules
        // TODO: Link them if they match
        console.log("Generating Correlation Keys...");
    }

    private async indexServingParticipants() {
        const teamsSnapshot = await getDocs(collection(db, "teams"));

        for (const teamDoc of teamsSnapshot.docs) {
            const schedulesSnapshot = await getDocs(collection(db, "teams", teamDoc.id, "serving_schedules"));
            const batch = writeBatch(db);
            let operationCount = 0;

            for (const docSnapshot of schedulesSnapshot.docs) {
                const data = docSnapshot.data();
                const roles = data.worship_roles || [];

                const participantSet = new Set<string>();
                roles.forEach((role: any) => {
                    if (role.memberIds && Array.isArray(role.memberIds)) {
                        role.memberIds.forEach((uid: string) => participantSet.add(uid));
                    }
                });

                // Also check 'items' for special assignments if any
                if (data.items) {
                    data.items.forEach((item: any) => {
                        if (item.assignments) {
                            item.assignments.forEach((assign: any) => {
                                if (assign.memberIds) {
                                    assign.memberIds.forEach((uid: string) => participantSet.add(uid));
                                }
                            });
                        }
                    });
                }

                const participants = Array.from(participantSet);
                batch.update(docSnapshot.ref, { participants: participants });
                operationCount++;
            }
            if (operationCount > 0) await batch.commit();
        }
    }

    // =========================================================================================
    // Phase 2: Structural Migration (Deep Copy)
    // =========================================================================================

    private async migrateTeamsAndMembers() {
        const teamsSnapshot = await getDocs(collection(db, "teams"));

        for (const teamDoc of teamsSnapshot.docs) {
            const teamData = teamDoc.data();
            const userIds = teamData.users || []; // Legacy array

            const batch = writeBatch(db);
            let opCount = 0;

            for (const uid of userIds) {
                const memberRef = doc(db, "teams", teamDoc.id, "members", uid);
                // Check if role is admin
                const isAdmin = (teamData.admins || []).includes(uid);

                batch.set(memberRef, {
                    uid: uid,
                    role: isAdmin ? "admin" : "member",
                    joined_at: Timestamp.now() // Estimate
                }, { merge: true });
                opCount++;
            }

            if (opCount > 0) await batch.commit();
        }
    }

    private async migrateSubCollections() {
        // 1. Migrate root Worships -> teams/{teamId}/worships
        const worshipsSnapshot = await getDocs(collection(db, "worships"));
        const wBatch = writeBatch(db);
        let wCount = 0;

        for (const wDoc of worshipsSnapshot.docs) {
            const data = wDoc.data();
            if (!data.team_id) continue;

            const newRef = doc(db, "teams", data.team_id, "worships", wDoc.id);
            wBatch.set(newRef, data);
            wCount++;
        }
        if (wCount > 0) await wBatch.commit();

        // 2. Migrate root Songs -> teams/{teamId}/songs
        const songsSnapshot = await getDocs(collection(db, "songs"));

        // Critical Optimization: Pre-fetch and group sub-items
        const sheetsSnap = await getDocs(collection(db, "music_sheets"));
        const commentsSnap = await getDocs(collection(db, "song_comments"));

        const sheetsBySong: Record<string, DocumentData[]> = {};
        sheetsSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.song_id) {
                if (!sheetsBySong[data.song_id]) sheetsBySong[data.song_id] = [];
                sheetsBySong[data.song_id].push({ id: doc.id, ...data });
            }
        });

        const commentsBySong: Record<string, DocumentData[]> = {};
        commentsSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.song_id) {
                if (!commentsBySong[data.song_id]) commentsBySong[data.song_id] = [];
                commentsBySong[data.song_id].push({ id: doc.id, ...data });
            }
        });

        for (const sDoc of songsSnapshot.docs) {
            const data = sDoc.data();
            if (!data.team_id) continue;

            await runTransaction(db, async (txn) => {
                const newSongRef = doc(db, "teams", data.team_id, "songs", sDoc.id);
                txn.set(newSongRef, data);
            });

            // Migrate Sheets using Map
            const relatedSheets = sheetsBySong[sDoc.id] || [];
            if (relatedSheets.length > 0) {
                const sheetBatch = writeBatch(db);
                relatedSheets.forEach(sheet => {
                    const newSheetRef = doc(db, "teams", data.team_id, "songs", sDoc.id, "sheets", sheet.id);
                    // Remove id from data payload if it exists to avoid duplication
                    const { id, ...sheetData } = sheet;
                    sheetBatch.set(newSheetRef, sheetData);
                });
                await sheetBatch.commit();
            }

            // Migrate Comments using Map
            const relatedComments = commentsBySong[sDoc.id] || [];
            if (relatedComments.length > 0) {
                const commentBatch = writeBatch(db);
                relatedComments.forEach(comment => {
                    const newCommentRef = doc(db, "teams", data.team_id, "songs", sDoc.id, "comments", comment.id);
                    const { id, ...commentData } = comment;
                    commentBatch.set(newCommentRef, commentData);
                });
                await commentBatch.commit();
            }
        }

        // 3. Migrate Notices
        const noticesSnapshot = await getDocs(collection(db, "notices"));
        const nBatch = writeBatch(db);
        let nCount = 0;
        for (const nDoc of noticesSnapshot.docs) {
            const data = nDoc.data();
            if (!data.team_id) continue;
            const newRef = doc(db, "teams", data.team_id, "notices", nDoc.id);
            nBatch.set(newRef, data);
            nCount++;
        }
        if (nCount > 0) await nBatch.commit();
    }

    private async migrateTags() {
        const tagsSnapshot = await getDocs(collection(db, "tags"));
        const batch = writeBatch(db);
        let count = 0;

        for (const tagDoc of tagsSnapshot.docs) {
            const data = tagDoc.data();
            const legacyId = tagDoc.id; // Pattern: {teamId}-스플릿-{tagName}

            if (legacyId.includes("-스플릿-")) {
                const [teamId, ...rest] = legacyId.split("-스플릿-");
                const tagName = rest.join("-스플릿-"); // In case tag name has split char

                if (teamId && tagName) {
                    const newRef = doc(db, "teams", teamId, "song_tags", tagName);
                    batch.set(newRef, {
                        name: tagName,
                        original_id: legacyId // Keep trace
                    });
                    count++;
                }
            }
        }
        if (count > 0) await batch.commit();
    }
    // =========================================================================================
    // Phase 3: Cleanup (Destructive)
    // =========================================================================================

    async cleanupLegacyData(onProgress: (log: string) => void): Promise<boolean> {
        try {
            onProgress("Starting Legacy Data Cleanup...");

            const collectionsToDelete = [
                "songs",
                "worships",
                "notices",
                "tags",
                "music_sheets",
                "song_comments"
            ];

            for (const colName of collectionsToDelete) {
                onProgress(`Deleting collection: ${colName}...`);
                await this.deleteCollectionInBatches(colName, onProgress);
            }

            onProgress("Legacy Data Cleanup Finished!");
            return true;
        } catch (e: any) {
            onProgress(`[ERROR] Cleanup Failed: ${e.message}`);
            return false;
        }
    }

    private async deleteCollectionInBatches(collectionName: string, onProgress: (log: string) => void) {
        const colRef = collection(db, collectionName);

        while (true) {
            const snapshot = await getDocs(query(colRef, limit(400)));
            if (snapshot.empty) break;

            const batch = writeBatch(db);
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            onProgress(`Deleted ${snapshot.size} docs from ${collectionName}`);
        }
    }
}

export default MigrationService.getInstance();
