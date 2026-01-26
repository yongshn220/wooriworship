import * as admin from 'firebase-admin';
import { parseLocalDate } from "@/components/util/helper/helper-functions";

// Types for clarity
type Firestore = admin.firestore.Firestore;
type DocumentData = admin.firestore.DocumentData;
type Timestamp = admin.firestore.Timestamp;
const Timestamp = admin.firestore.Timestamp;

export class AdminMigrationService {
    private static instance: AdminMigrationService;
    private db: Firestore;

    constructor(db: Firestore) {
        this.db = db;
    }

    public static getInstance(db: Firestore): AdminMigrationService {
        if (!AdminMigrationService.instance) {
            AdminMigrationService.instance = new AdminMigrationService(db);
        }
        return AdminMigrationService.instance;
    }

    /**
     * Executes the full migration process in sequence.
     */
    async runFullMigration(onProgress: (log: string) => void): Promise<boolean> {
        try {
            onProgress("Starting Full Migration (Admin SDK)...");

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
        // 1. Normalize ServingSchedule.date
        const teamsSnapshot = await this.db.collection("teams").get();
        for (const teamDoc of teamsSnapshot.docs) {
            const schedulesSnapshot = await this.db.collection("teams").doc(teamDoc.id).collection("serving_schedules").get();
            if (schedulesSnapshot.empty) continue;

            let batch = this.db.batch();
            let count = 0;

            for (const docSnapshot of schedulesSnapshot.docs) {
                const data = docSnapshot.data();
                if (!data.date) continue;

                let newTimestamp: Timestamp | null = null;
                if (typeof data.date === 'string') {
                    const d = parseLocalDate(data.date);
                    d.setHours(12, 0, 0, 0);
                    newTimestamp = Timestamp.fromDate(d);
                } else if (data.date instanceof Timestamp) {
                    const d = data.date.toDate();
                    d.setHours(12, 0, 0, 0);
                    newTimestamp = Timestamp.fromDate(d);
                } else if (data.date.seconds) {
                    const d = new Date(data.date.seconds * 1000);
                    d.setHours(12, 0, 0, 0);
                    newTimestamp = Timestamp.fromDate(d);
                }

                if (newTimestamp) {
                    batch.update(docSnapshot.ref, { date: newTimestamp });
                    count++;
                    if (count >= 500) {
                        await batch.commit();
                        batch = this.db.batch();
                        count = 0;
                    }
                }
            }
            if (count > 0) await batch.commit();
        }

        // 2. Normalize Worship.worship_date
        const worshipsSnapshot = await this.db.collection("worships").get();
        if (!worshipsSnapshot.empty) {
            let wBatch = this.db.batch();
            let wCount = 0;

            for (const docSnapshot of worshipsSnapshot.docs) {
                const data = docSnapshot.data();
                if (!data.worship_date) continue;

                let newTimestamp: Timestamp | null = null;
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
                    if (wCount >= 500) {
                        await wBatch.commit();
                        wBatch = this.db.batch();
                        wCount = 0;
                    }
                }
            }
            if (wCount > 0) await wBatch.commit();
        }
    }

    private async generateCorrelationKeys() {
        console.log("Generating Correlation Keys...");
    }

    private async indexServingParticipants() {
        const teamsSnapshot = await this.db.collection("teams").get();

        for (const teamDoc of teamsSnapshot.docs) {
            const schedulesSnapshot = await this.db.collection("teams").doc(teamDoc.id).collection("serving_schedules").get();
            if (schedulesSnapshot.empty) continue;

            let batch = this.db.batch();
            let count = 0;

            for (const docSnapshot of schedulesSnapshot.docs) {
                const data = docSnapshot.data();
                const roles = data.worship_roles || [];
                const participantSet = new Set<string>();

                roles.forEach((role: any) => {
                    if (role.memberIds && Array.isArray(role.memberIds)) {
                        role.memberIds.forEach((uid: string) => participantSet.add(uid));
                    }
                });

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
                count++;

                if (count >= 500) {
                    await batch.commit();
                    batch = this.db.batch();
                    count = 0;
                }
            }
            if (count > 0) await batch.commit();
        }
    }

    // =========================================================================================
    // Phase 2: Structural Migration (Deep Copy)
    // =========================================================================================

    private async migrateTeamsAndMembers() {
        const teamsSnapshot = await this.db.collection("teams").get();

        for (const teamDoc of teamsSnapshot.docs) {
            const teamData = teamDoc.data();
            const userIds = teamData.users || [];

            let batch = this.db.batch();
            let opCount = 0;

            for (const uid of userIds) {
                const memberRef = this.db.doc(`teams/${teamDoc.id}/members/${uid}`);
                const isAdmin = (teamData.admins || []).includes(uid);

                batch.set(memberRef, {
                    uid: uid,
                    role: isAdmin ? "admin" : "member",
                    joined_at: Timestamp.now()
                }, { merge: true });
                opCount++;

                if (opCount >= 500) {
                    await batch.commit();
                    batch = this.db.batch();
                    opCount = 0;
                }
            }
            if (opCount > 0) await batch.commit();
        }
    }

    private async migrateSubCollections() {
        // 1. Migrate root Worships -> teams/{teamId}/worships
        const worshipsSnapshot = await this.db.collection("worships").get();
        if (!worshipsSnapshot.empty) {
            let wBatch = this.db.batch();
            let wCount = 0;

            for (const wDoc of worshipsSnapshot.docs) {
                const data = wDoc.data();
                if (!data.team_id) continue;

                const newRef = this.db.doc(`teams/${data.team_id}/worships/${wDoc.id}`);
                wBatch.set(newRef, data);
                wCount++;

                if (wCount >= 500) {
                    await wBatch.commit();
                    wBatch = this.db.batch();
                    wCount = 0;
                }
            }
            if (wCount > 0) await wBatch.commit();
        }

        // 2. Migrate root Songs -> teams/{teamId}/songs
        const songsSnapshot = await this.db.collection("songs").get();

        // Critical Optimization: Pre-fetch and group sub-items
        const sheetsSnap = await this.db.collection("music_sheets").get();
        const commentsSnap = await this.db.collection("song_comments").get();

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

            await this.db.runTransaction(async (txn) => {
                const newSongRef = this.db.doc(`teams/${data.team_id}/songs/${sDoc.id}`);
                txn.set(newSongRef, data);
            });

            // Migrate Sheets
            const relatedSheets = sheetsBySong[sDoc.id] || [];
            if (relatedSheets.length > 0) {
                const sheetChunks = this.chunkArray(relatedSheets, 500);
                for (const chunk of sheetChunks) {
                    const sheetBatch = this.db.batch();
                    chunk.forEach(sheet => {
                        const newRef = this.db.doc(`teams/${data.team_id}/songs/${sDoc.id}/sheets/${sheet.id}`);
                        // Remove id from data payload if it exists to avoid duplication
                        const { id, ...sheetData } = sheet;

                        // Transform Legacy Fields
                        if (!sheetData.urls && sheetData.url) {
                            sheetData.urls = [sheetData.url];
                            delete sheetData.url;
                        }

                        sheetBatch.set(newRef, sheetData);
                    });
                    await sheetBatch.commit();
                }
            }

            // Migrate Comments
            const relatedComments = commentsBySong[sDoc.id] || [];
            if (relatedComments.length > 0) {
                const commentChunks = this.chunkArray(relatedComments, 500);
                for (const chunk of commentChunks) {
                    const commentBatch = this.db.batch();
                    chunk.forEach(comment => {
                        const newRef = this.db.doc(`teams/${data.team_id}/songs/${sDoc.id}/comments/${comment.id}`);
                        const { id, ...commentData } = comment;
                        commentBatch.set(newRef, commentData);
                    });
                    await commentBatch.commit();
                }
            }
        }

        // 3. Migrate Notices
        const noticesSnapshot = await this.db.collection("notices").get();
        if (!noticesSnapshot.empty) {
            let nBatch = this.db.batch();
            let nCount = 0;
            for (const nDoc of noticesSnapshot.docs) {
                const data = nDoc.data();
                if (!data.team_id) continue;

                const newRef = this.db.doc(`teams/${data.team_id}/notices/${nDoc.id}`);

                // Transform Legacy Data
                const newData = {
                    ...data,
                    title: data.subject || data.title || "No Title",
                    body: data.content || data.body || "",
                    // Map legacy timestamp if needed, assume created_at or date exists
                    created_by: {
                        id: data.user_id || "unknown", // Legacy might have user_id
                        time: data.created_at || data.date || Timestamp.now()
                    },
                    last_updated_time: data.updated_at || data.created_at || Timestamp.now()
                };

                // Remove legacy fields if desired, or keep them. 
                // Let's keep for safety but ensure new fields exist.

                nBatch.set(newRef, newData);
                nCount++;

                if (nCount >= 500) {
                    await nBatch.commit();
                    nBatch = this.db.batch();
                    nCount = 0;
                }
            }
            if (nCount > 0) await nBatch.commit();
        }
    }

    private async migrateTags() {
        const tagsSnapshot = await this.db.collection("tags").get();
        if (tagsSnapshot.empty) return;

        let batch = this.db.batch();
        let count = 0;

        for (const tagDoc of tagsSnapshot.docs) {
            const data = tagDoc.data();
            const legacyId = tagDoc.id;

            if (legacyId.includes("-스플릿-")) {
                const [teamId, ...rest] = legacyId.split("-스플릿-");
                const tagName = rest.join("-스플릿-");

                if (teamId && tagName) {
                    const newRef = this.db.doc(`teams/${teamId}/song_tags/${tagName}`);
                    batch.set(newRef, {
                        name: tagName,
                        original_id: legacyId
                    });
                    count++;

                    if (count >= 500) {
                        await batch.commit();
                        batch = this.db.batch();
                        count = 0;
                    }
                }
            }
        }
        if (count > 0) await batch.commit();
    }

    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunked = [];
        for (let i = 0; i < array.length; i += size) {
            chunked.push(array.slice(i, i + size));
        }
        return chunked;
    }
}
