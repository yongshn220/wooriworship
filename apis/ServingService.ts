import BaseService from "./BaseService";
import { ServingRole, ServingSchedule } from "@/models/serving";
import { db } from "@/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    deleteDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    writeBatch,
    increment,
    arrayUnion,
    arrayRemove,
    Timestamp
} from "firebase/firestore";
import LinkingService from "./LinkingService";
import { parseLocalDate, timestampToDateString } from "@/components/util/helper/helper-functions";

class ServingService extends BaseService {
    private static instance: ServingService;

    private constructor() {
        super("serving"); // Placeholder, not strictly used as we use custom paths
    }

    public static getInstance(): ServingService {
        if (!ServingService.instance) {
            ServingService.instance = new ServingService();
        }
        return ServingService.instance;
    }

    // --- Roles ---

    async getRoles(teamId: string): Promise<ServingRole[]> {
        try {
            const q = query(
                collection(db, "teams", teamId, "serving_roles"),
                orderBy("order", "asc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServingRole));
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async createRole(teamId: string, role: Omit<ServingRole, "id">): Promise<ServingRole> {
        const ref = doc(collection(db, "teams", teamId, "serving_roles"));
        const newRole = { ...role, id: ref.id };
        await setDoc(ref, newRole);
        return newRole;
    }

    async updateRole(teamId: string, role: ServingRole): Promise<void> {
        const ref = doc(db, "teams", teamId, "serving_roles", role.id);
        await setDoc(ref, role, { merge: true });
    }

    async deleteRole(teamId: string, roleId: string): Promise<void> {
        const ref = doc(db, "teams", teamId, "serving_roles", roleId);
        await deleteDoc(ref);
    }

    async updateRolesOrder(teamId: string, roles: ServingRole[]): Promise<void> {
        const batch = writeBatch(db);

        roles.forEach((role, index) => {
            const docRef = doc(db, "teams", teamId, "serving_roles", role.id);
            batch.update(docRef, { order: index });
        });

        await batch.commit();
    }

    async initStandardRoles(teamId: string): Promise<void> {
        const standardRoles = [
            "Leader", "Piano", "Synthesizer", "Drum", "Singer",
            "Bass Guitar", "Acoustic Guitar", "Electric Guitar", "Media Team", "PPT"
        ];

        const rolesRef = collection(db, "teams", teamId, "serving_roles");

        try {
            const existingSnapshot = await getDocs(rolesRef);
            const existingNames = new Set(existingSnapshot.docs.map(doc => (doc.data().name as string).toLowerCase()));

            const rolesToAdd = standardRoles.filter(name => !existingNames.has(name.toLowerCase()));

            if (rolesToAdd.length === 0) return; // All exist

            const batch = writeBatch(db);

            rolesToAdd.forEach((name, index) => {
                const newRoleRef = doc(rolesRef);
                batch.set(newRoleRef, { id: newRoleRef.id, teamId, name, order: 100 + index });
            });

            await batch.commit();
        } catch (e) {
            console.error("Failed to initialize standard roles:", e);
        }
    }

    async addDefaultMember(teamId: string, roleId: string, memberId: string): Promise<void> {
        const ref = doc(db, "teams", teamId, "serving_roles", roleId);
        await updateDoc(ref, {
            default_members: arrayUnion(memberId)
        });
    }

    async removeDefaultMember(teamId: string, roleId: string, memberId: string): Promise<void> {
        const ref = doc(db, "teams", teamId, "serving_roles", roleId);
        await updateDoc(ref, {
            default_members: arrayRemove(memberId)
        });
    }

    async cleanupMember(teamId: string, memberId: string): Promise<void> {
        try {
            const q = query(
                collection(db, "teams", teamId, "serving_roles"),
                where("default_members", "array-contains", memberId)
            );
            const rolesSnapshot = await getDocs(q);

            const batch = writeBatch(db);
            rolesSnapshot.docs.forEach((doc) => {
                batch.update(doc.ref, {
                    default_members: arrayRemove(memberId)
                });
            });
            await batch.commit();
        } catch (e) {
            console.error("Failed to cleanup serving member:", e);
        }
    }

    // --- Schedules ---

    async getSchedules(teamId: string, startDate: string, endDate: string): Promise<ServingSchedule[]> {
        try {
            const startD = parseLocalDate(startDate);
            startD.setHours(0, 0, 0, 0);
            const endD = parseLocalDate(endDate);
            endD.setHours(23, 59, 59, 999);

            const colRef = collection(db, "teams", teamId, "serving_schedules");

            // Fetch both Timestamp and String for transition period
            const [tsSnapshot, strSnapshot] = await Promise.all([
                getDocs(query(
                    colRef,
                    where("date", ">=", Timestamp.fromDate(startD)),
                    where("date", "<=", Timestamp.fromDate(endD))
                )),
                getDocs(query(
                    colRef,
                    where("date", ">=", startDate),
                    where("date", "<=", endDate)
                ))
            ]);

            const results = new Map<string, ServingSchedule>();
            tsSnapshot.docs.forEach(doc => results.set(doc.id, { id: doc.id, ...doc.data() } as ServingSchedule));
            strSnapshot.docs.forEach(doc => results.set(doc.id, { id: doc.id, ...doc.data() } as ServingSchedule));

            return Array.from(results.values());
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async getPreviousSchedules(teamId: string, beforeDate: Date, limitCount: number = 5): Promise<ServingSchedule[]> {
        try {
            const beforeDateStr = timestampToDateString(Timestamp.fromDate(beforeDate));
            const colRef = collection(db, "teams", teamId, "serving_schedules");

            const [tsSnapshot, strSnapshot] = await Promise.all([
                getDocs(query(
                    colRef,
                    where("date", "<", Timestamp.fromDate(beforeDate)),
                    orderBy("date", "desc"),
                    limit(limitCount)
                )),
                getDocs(query(
                    colRef,
                    where("date", "<", beforeDateStr),
                    orderBy("date", "desc"),
                    limit(limitCount)
                ))
            ]);

            const results = new Map<string, ServingSchedule>();
            tsSnapshot.docs.forEach(doc => results.set(doc.id, { id: doc.id, ...doc.data() } as ServingSchedule));
            strSnapshot.docs.forEach(doc => results.set(doc.id, { id: doc.id, ...doc.data() } as ServingSchedule));

            // Convert to array and sort DESC to respect the limit logic across both sources
            const combined = Array.from(results.values()).sort((a, b) => {
                const dateA = a.date instanceof Timestamp ? a.date.toDate().getTime() : new Date(a.date).getTime();
                const dateB = b.date instanceof Timestamp ? b.date.toDate().getTime() : new Date(b.date).getTime();
                return dateB - dateA; // DESC
            });

            return combined.slice(0, limitCount);
        } catch (e) {
            console.error("Failed to fetch previous schedules", e);
            return [];
        }
    }

    async getRecentSchedules(teamId: string, limitCount: number = 5): Promise<ServingSchedule[]> {
        try {
            const q = query(
                collection(db, "teams", teamId, "serving_schedules"),
                orderBy("date", "desc"),
                limit(limitCount)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServingSchedule));
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async getRecentSchedulesByTag(teamId: string, tag: string, limitCount: number = 10): Promise<ServingSchedule[]> {
        try {
            const q = query(
                collection(db, "teams", teamId, "serving_schedules"),
                where("service_tags", "array-contains", tag),
                orderBy("date", "desc"),
                limit(limitCount)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServingSchedule));
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async getScheduleByDate(teamId: string, date: string): Promise<ServingSchedule | null> {
        try {
            const startD = parseLocalDate(date);
            startD.setHours(0, 0, 0, 0);
            const nextD = new Date(startD);
            nextD.setDate(startD.getDate() + 1);

            const colRef = collection(db, "teams", teamId, "serving_schedules");

            const [tsSnapshot, strSnapshot] = await Promise.all([
                getDocs(query(
                    colRef,
                    where("date", ">=", Timestamp.fromDate(startD)),
                    where("date", "<", Timestamp.fromDate(nextD)),
                    limit(1)
                )),
                getDocs(query(
                    colRef,
                    where("date", "==", date),
                    limit(1)
                ))
            ]);

            const doc = tsSnapshot.docs[0] || strSnapshot.docs[0];
            if (!doc) return null;
            return { id: doc.id, ...doc.data() } as ServingSchedule;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async getScheduleById(teamId: string, scheduleId: string): Promise<ServingSchedule | null> {
        try {
            const docRef = doc(db, "teams", teamId, "serving_schedules", scheduleId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) return null;
            return { id: docSnap.id, ...docSnap.data() } as ServingSchedule;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async createSchedule(teamId: string, schedule: Omit<ServingSchedule, "id">): Promise<ServingSchedule> {
        const ref = doc(collection(db, "teams", teamId, "serving_schedules"));

        const normalizedDate = typeof schedule.date === 'string' ? parseLocalDate(schedule.date) : schedule.date.toDate();
        normalizedDate.setHours(12, 0, 0, 0); // Normalize to local noon

        const newSchedule = {
            ...schedule,
            id: ref.id,
            date: Timestamp.fromDate(normalizedDate),
            worship_roles: schedule.worship_roles || [], // Explicitly save roles
        };
        await setDoc(ref, newSchedule);
        if (schedule.worship_id) {
            await LinkingService.linkWorshipAndServing(teamId, schedule.worship_id, newSchedule.id);
        }

        // Update Stats
        if (schedule.service_tags && schedule.service_tags.length > 0 && schedule.date) {
            const dateStr = typeof schedule.date === 'string' ? schedule.date : timestampToDateString(schedule.date);
            await this.updateTagStats(teamId, schedule.service_tags, dateStr, "add");
        }

        return newSchedule;
    }

    async updateSchedule(teamId: string, schedule: ServingSchedule): Promise<void> {
        const docRef = doc(db, "teams", teamId, "serving_schedules", schedule.id);
        const oldDoc = await getDoc(docRef);
        const oldData = oldDoc.data() as ServingSchedule | undefined;

        const normalizedDate = typeof schedule.date === 'string' ? parseLocalDate(schedule.date) : (schedule.date as Timestamp).toDate();
        normalizedDate.setHours(12, 0, 0, 0);

        const updatedSchedule = {
            ...schedule,
            date: Timestamp.fromDate(normalizedDate),
            worship_roles: schedule.worship_roles || [], // Explicitly save roles
            items: schedule.items || [] // Explicitly save items
        };

        await setDoc(docRef, updatedSchedule, { merge: true });

        // Handle stats update if tags or date changed
        if (oldData) {
            // Remove old stats
            if (oldData.service_tags && oldData.service_tags.length > 0 && oldData.date) {
                const oldDateStr = typeof oldData.date === 'string' ? oldData.date : timestampToDateString(oldData.date);
                await this.updateTagStats(teamId, oldData.service_tags, oldDateStr, "remove");
            }
            // Add new stats
            if (schedule.service_tags && schedule.service_tags.length > 0 && schedule.date) {
                const newDateStr = typeof schedule.date === 'string' ? schedule.date : timestampToDateString(schedule.date as Timestamp);
                await this.updateTagStats(teamId, schedule.service_tags, newDateStr, "add");
            }
        }
    }

    async deleteSchedule(teamId: string, scheduleId: string): Promise<void> {
        await LinkingService.cleanupReferencesForServingDeletion(teamId, scheduleId);

        const docRef = doc(db, "teams", teamId, "serving_schedules", scheduleId);
        const docSnapshot = await getDoc(docRef);
        const data = docSnapshot.data() as ServingSchedule | undefined;

        // Remove stats before deletion
        if (data && data.service_tags && data.service_tags.length > 0 && data.date) {
            const dateStr = typeof data.date === 'string' ? data.date : timestampToDateString(data.date);
            await this.updateTagStats(teamId, data.service_tags, dateStr, "remove");
        }

        await deleteDoc(docRef);
    }

    // --- Templates ---

    async getTemplates(teamId: string): Promise<any[]> {
        try {
            const snapshot = await getDocs(collection(db, "teams", teamId, "serving_templates"));
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async createTemplate(teamId: string, template: any): Promise<void> {
        const ref = doc(collection(db, "teams", teamId, "serving_templates"));
        await setDoc(ref, { ...template, id: ref.id });
    }

    async updateTemplate(teamId: string, templateId: string, template: any): Promise<void> {
        const ref = doc(db, "teams", teamId, "serving_templates", templateId);
        await updateDoc(ref, template);
    }

    async deleteTemplate(teamId: string, templateId: string): Promise<void> {
        const ref = doc(db, "teams", teamId, "serving_templates", templateId);
        await deleteDoc(ref);
    }

    async initDefaultTemplate(teamId: string): Promise<void> {
        const SAMPLE_FLOW = [
            { title: '예배의 부르심', type: 'FLOW' },
            { title: '교독문', type: 'FLOW' },
            { title: '기도', type: 'FLOW' },
            { title: '찬양', type: 'FLOW' },
            { title: '설교', type: 'FLOW' },
            { title: '봉헌 및 광고', type: 'FLOW' },
            { title: '축도', type: 'FLOW' },
            { title: '자막/영상', type: 'SUPPORT' },
            { title: '음향', type: 'SUPPORT' },
        ];

        const templates = await this.getTemplates(teamId);
        if (templates.length > 0) return;

        const defaultTemplate = {
            name: "예배",
            teamId,
            items: SAMPLE_FLOW.map(i => ({ title: i.title, type: i.type, remarks: "" }))
        };
        await this.createTemplate(teamId, defaultTemplate);
    }

    // --- Helpers ---

    async findRoleByName(teamId: string, name: string): Promise<ServingRole | null> {
        const q = query(
            collection(db, "teams", teamId, "serving_roles"),
            where("name", "==", name),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ServingRole;
    }

    // --- Config (Custom Groups & Members) ---

    async getServingConfig(teamId: string): Promise<{ customGroups: string[], customNames: string[] }> {
        try {
            const docRef = doc(db, "teams", teamId, "serving_config", "general");
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return { customGroups: [], customNames: [] };
            const data = docSnap.data();
            return {
                customGroups: data?.custom_groups || [],
                customNames: data?.custom_names || []
            };
        } catch (e) {
            console.error(e);
            return { customGroups: [], customNames: [] };
        }
    }

    async addCustomGroup(teamId: string, groupName: string): Promise<void> {
        const ref = doc(db, "teams", teamId, "serving_config", "general");
        await setDoc(ref, { custom_groups: arrayUnion(groupName) }, { merge: true });
    }

    async addCustomMemberName(teamId: string, name: string): Promise<void> {
        const ref = doc(db, "teams", teamId, "serving_config", "general");
        await setDoc(ref, { custom_names: arrayUnion(name) }, { merge: true });
    }

    // --- Tag Stats (Advanced Smart Quick Select) ---

    async getTagStats(teamId: string): Promise<Record<string, { count: number, weekdays: Record<string, number>, last_used_at: any }>> {
        try {
            const docRef = doc(db, "teams", teamId, "config", "tag_stats");
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) return {};
            return docSnap.data()?.stats || {};
        } catch (e) {
            console.error("Failed to fetch tag stats", e);
            return {};
        }
    }

    async updateTagStats(teamId: string, tagIds: string[], dateString: string, mode: "add" | "remove"): Promise<void> {
        try {
            const statsRef = doc(db, "teams", teamId, "config", "tag_stats");
            // Parse date string (YYYY-MM-DD) as local date to avoid UTC shifts
            const [y, m, d] = dateString.split('-').map(Number);
            const date = new Date(y, m - 1, d);
            const weekday = date.getDay().toString(); // 0-6
            const incrementValue = mode === "add" ? 1 : -1;

            const statsUpdate: any = {};

            for (const tagId of tagIds) {
                // Construct nested object for deep merge
                statsUpdate[tagId] = {
                    count: increment(incrementValue),
                    weekdays: {
                        [weekday]: increment(incrementValue)
                    }
                };

                if (mode === "add") {
                    statsUpdate[tagId].last_used_at = new Date().toISOString();
                }
            }

            // Using set with merge to ensure document exists
            await setDoc(statsRef, { stats: statsUpdate }, { merge: true });
        } catch (e) {
            console.error("Failed to update tag stats", e);
        }
    }
}

export default ServingService.getInstance();
