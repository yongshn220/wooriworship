import * as admin from 'firebase-admin';
import { parseLocalDate } from "@/lib/date-utils";

// Types for clarity
type Firestore = admin.firestore.Firestore;
type DocumentData = admin.firestore.DocumentData;
type Timestamp = admin.firestore.Timestamp;
const Timestamp = admin.firestore.Timestamp;

import { ServiceEvent, ServiceSetlist, ServicePraiseTeam, ServiceFlow } from "@/models/services/ServiceEvent";

export class AdminMigrationApi {
    private static instance: AdminMigrationApi;
    private db: Firestore;

    constructor(db: Firestore) {
        this.db = db;
    }

    public static getInstance(db: Firestore): AdminMigrationApi {
        if (!AdminMigrationApi.instance) {
            AdminMigrationApi.instance = new AdminMigrationApi(db);
        }
        return AdminMigrationApi.instance;
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

            onProgress("1-4. Normalizing Serving Schedules (Legacy Fields)...");
            await this.migrateServingSchedules();

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
    // Phase 3: V2 -> V3 Migration (Relational Schema)
    // =========================================================================================

    public async migrateToUnifiedServices(teamId: string) {
        console.log(`[V3 Migration] Starting for team: ${teamId}`);

        // 0. Cleanup existing V3 services for a clean slate
        console.log(`[V3 Migration] Cleaning up existing services for team: ${teamId}`);
        await this.deleteCollection(`teams/${teamId}/services`, 100);

        // 1. Fetch All V2 Data
        const worshipsSnap = await this.db.collection(`teams/${teamId}/worships`).get();
        const schedulesSnap = await this.db.collection(`teams/${teamId}/serving_schedules`).get();

        const worships = worshipsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        const schedules = schedulesSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

        console.log(`[V3 Migration] Found ${worships.length} worships, ${schedules.length} schedules.`);

        // 2. Join Strategy (Robust Date Join)
        const joinedMap = new Map<string, {
            date: Timestamp,
            title: string,
            tags: string[],
            worship?: any,
            schedule?: any
        }>();

        const getKey = (timestamp: Timestamp, tags: string[] = []) => {
            const d = timestamp.toDate();
            // Robust YYYY-MM-DD extraction using UTC to match Firestore default serialization
            const year = d.getUTCFullYear();
            const month = String(d.getUTCMonth() + 1).padStart(2, '0');
            const day = String(d.getUTCDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const sortedTags = (tags || []).sort().filter(t => t);
            return sortedTags.length > 0 ? `${dateStr}_${sortedTags.join('_')}` : dateStr;
        };

        // Pass 1: Schedules (People Data)
        for (const sch of schedules) {
            const dateValue = sch.date;
            const tags = sch.service_tags || [];
            if (!dateValue) continue;

            const date = dateValue instanceof Timestamp ? dateValue : Timestamp.fromDate(new Date(dateValue));
            const key = getKey(date, tags);

            if (!joinedMap.has(key)) {
                joinedMap.set(key, {
                    date,
                    title: sch.title || "Service",
                    tags,
                    schedule: sch
                });
            } else {
                joinedMap.get(key)!.schedule = sch;
            }
        }

        // Pass 2: Worships (Song Data)
        for (const w of worships) {
            const dateValue = w.worship_date || w.date;
            const tags = w.service_tags || [];
            if (!dateValue) continue;

            const date = dateValue instanceof Timestamp ? dateValue : Timestamp.fromDate(new Date(dateValue));
            const key = getKey(date, tags);

            if (joinedMap.has(key)) {
                joinedMap.get(key)!.worship = w;
            } else {
                joinedMap.set(key, {
                    date,
                    title: w.title || "Worship Service",
                    tags,
                    worship: w
                });
            }
        }

        console.log(`[V3 Migration] Joined into ${joinedMap.size} unified services.`);

        // 3. Transform & Write
        let batch = this.db.batch();
        let opCount = 0;
        const keys = Array.from(joinedMap.keys());

        for (const key of keys) {
            const data = joinedMap.get(key)!;
            // Use Random ID (Firestore Auto-ID) to allow multiple services per day
            const serviceRef = this.db.collection(`teams/${teamId}/services`).doc();

            // Use single tagId (migrate first tag found, or null)
            const tagId = (data.tags && data.tags.length > 0) ? data.tags[0] : null;

            // Map legacy 'roles' to new 'bands.worship_roles'
            const worship_roles = data.schedule?.worship_roles || data.schedule?.roles || [];

            const serviceDoc: any = {
                id: serviceRef.id,
                teamId,
                date: data.date,
                title: data.title,
                tagId: tagId, // Renamed from service_tags array to single string
                created_at: Timestamp.now(),
                updated_at: Timestamp.now()
            };

            batch.set(serviceRef, serviceDoc);
            opCount++;

            // --- Pillar 1: setlist (SubCollection) ---
            if (data.worship) {
                const setlistRef = serviceRef.collection('setlists').doc('main');
                const setlistData: any = {
                    id: 'main',
                    songs: data.worship.songs || [],
                    beginning_song: data.worship.beginning_song || null,
                    ending_song: data.worship.ending_song || null,
                    description: data.worship.description || "",
                    link: data.worship.link || ""
                };
                batch.set(setlistRef, setlistData);
                opCount++;
            }

            // --- Pillar 2: bands (SubCollection) ---
            if (worship_roles.length > 0) {
                const bandRef = serviceRef.collection('bands').doc('main');
                const bandData: any = {
                    id: 'main',
                    worship_roles: worship_roles
                };
                batch.set(bandRef, bandData);
                opCount++;
            }

            // --- Pillar 3: flows (SubCollection) ---
            if (data.schedule?.items && data.schedule.items.length > 0) {
                const flowRef = serviceRef.collection('flows').doc('main');
                const flowData: any = {
                    id: 'main',
                    items: data.schedule.items || [],
                    note: data.schedule.note || ""
                };
                batch.set(flowRef, flowData);
                opCount++;
            }
            opCount++;

            if (opCount >= 400) {
                await batch.commit();
                batch = this.db.batch();
                opCount = 0;
            }
        }

        if (opCount > 0) await batch.commit();
        console.log(`[V3 Migration] Successfully written ${joinedMap.size} unified services.`);
    }

    public async nukeV2Collections(teamId: string) {
        console.log(`[V3 Cleanup] Duking V2 collections for team: ${teamId}`);
        await this.deleteCollection(`teams/${teamId}/worships`, 100);
        await this.deleteCollection(`teams/${teamId}/serving_schedules`, 100);
        console.log(`[V3 Cleanup] Finished.`);
    }

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

    // Made public for testing or used internally
    public async migrateServingSchedules() {
        const teamsSnapshot = await this.db.collection("teams").get();

        for (const teamDoc of teamsSnapshot.docs) {
            const schedulesSnapshot = await this.db.collection("teams").doc(teamDoc.id).collection("serving_schedules").get();
            if (schedulesSnapshot.empty) continue;

            let batch = this.db.batch();
            let count = 0;

            for (const docSnapshot of schedulesSnapshot.docs) {
                const data = docSnapshot.data();

                // Transform Legacy Fields
                const updates: any = {};

                // 1. name -> title
                if (!data.title && data.name) {
                    updates.title = data.name;
                }

                if (Object.keys(updates).length > 0) {
                    batch.update(docSnapshot.ref, updates);
                    count++;
                }

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

                        // Transform Legacy Fields
                        commentData.comment = commentData.comment || commentData.content || commentData.text || "";

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

    public async migrateServiceTagsToSubcollection(teamId: string) {
        console.log(`[Service Tag Migration] Starting for team: ${teamId}`);
        const teamRef = this.db.collection("teams").doc(teamId);
        const teamSnap = await teamRef.get();
        if (!teamSnap.exists) return;

        const teamData = teamSnap.data() || {};
        const serviceTags = teamData.service_tags || [];

        if (serviceTags.length === 0) {
            console.log(`[Service Tag Migration] No tags found for team: ${teamId}`);
            return;
        }

        let batch = this.db.batch();
        let opCount = 0;

        for (const tag of serviceTags) {
            // Use name as ID for uniqueness and consistency with song_tags
            const tagId = tag.name;
            const tagRef = teamRef.collection("service_tags").doc(tagId);

            batch.set(tagRef, {
                id: tagId,
                name: tag.name,
                order: tag.order ?? 0,
                created_at: Timestamp.now()
            }, { merge: true });
            opCount++;

            if (opCount >= 500) {
                await batch.commit();
                batch = this.db.batch();
                opCount = 0;
            }
        }

        if (opCount > 0) await batch.commit();
        console.log(`[Service Tag Migration] Successfully migrated ${serviceTags.length} tags for team: ${teamId}`);
    }

    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunked = [];
        for (let i = 0; i < array.length; i += size) {
            chunked.push(array.slice(i, i + size));
        }
        return chunked;
    }

    public async cleanupLegacyData(onProgress: (log: string) => void) {
        const legacyCollections = [
            "songs",
            "worships",
            "music_sheets",
            "song_comments",
            "notices",
            "tags"
        ];

        for (const colName of legacyCollections) {
            onProgress(`Deleting collection: ${colName}...`);
            await this.deleteCollection(colName, 500);
        }

        onProgress("Legacy Data Cleanup Finished!");
    }

    private async deleteCollection(collectionPath: string, batchSize: number) {
        const collectionRef = this.db.collection(collectionPath);
        const query = collectionRef.orderBy('__name__').limit(batchSize);

        return new Promise((resolve, reject) => {
            this.deleteQueryBatch(query, resolve).catch(reject);
        });
    }

    private async deleteQueryBatch(query: admin.firestore.Query, resolve: Function) {
        const snapshot = await query.get();

        const batchSize = snapshot.size;
        if (batchSize === 0) {
            resolve();
            return;
        }

        const batch = this.db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        console.log(`[Batch] Deleted ${batchSize} docs...`);

        // Use setTimeout to avoid stack overflow but ensure execution
        // process.nextTick can sometimes be too aggressive or lose context in certain envs
        if (batchSize > 0) {
            // Recursive call
            this.deleteQueryBatch(query, resolve);
        } else {
            resolve();
        }
    }
}
