import BaseService from "./BaseService";
import { ServingRole, ServingSchedule } from "@/models/serving";
import { firestore } from "@/firebase";
import { Timestamp } from "@firebase/firestore";
import { arrayRemove, arrayUnion, increment } from "firebase/firestore";
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
            const snapshot = await firestore
                .collection("teams")
                .doc(teamId)
                .collection("serving_roles")
                .orderBy("order", "asc")
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServingRole));
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async createRole(teamId: string, role: Omit<ServingRole, "id">): Promise<ServingRole> {
        const ref = firestore.collection("teams").doc(teamId).collection("serving_roles").doc();
        const newRole = { ...role, id: ref.id };
        await ref.set(newRole);
        return newRole;
    }

    async updateRole(teamId: string, role: ServingRole): Promise<void> {
        await firestore
            .collection("teams")
            .doc(teamId)
            .collection("serving_roles")
            .doc(role.id)
            .set(role, { merge: true });
    }

    async deleteRole(teamId: string, roleId: string): Promise<void> {
        await firestore.collection("teams").doc(teamId).collection("serving_roles").doc(roleId).delete();
    }

    async updateRolesOrder(teamId: string, roles: ServingRole[]): Promise<void> {
        const batch = firestore.batch();
        const collectionRef = firestore.collection("teams").doc(teamId).collection("serving_roles");

        roles.forEach((role, index) => {
            const docRef = collectionRef.doc(role.id);
            batch.update(docRef, { order: index });
        });

        await batch.commit();
    }

    async initStandardRoles(teamId: string): Promise<void> {
        const standardRoles = [
            "Leader", "Piano", "Synthesizer", "Drum", "Singer",
            "Bass Guitar", "Acoustic Guitar", "Electric Guitar", "Media Team", "PPT"
        ];

        const rolesRef = firestore.collection("teams").doc(teamId).collection("serving_roles");

        try {
            await firestore.runTransaction(async (transaction) => {
                // Fetch all existing roles for this team
                // Note: Transaction get queries must be done before writes.
                // However, fetching collection inside transaction requires query.
                // Firestore transactions require reads before writes.
                // Simple get() on collection is not directly supported in all transaction SDKs as 'read'.
                // But we can do a query.
                const existingSnapshot = await transaction.get(rolesRef);
                const existingNames = new Set(existingSnapshot.docs.map(doc => (doc.data().name as string).toLowerCase()));

                const rolesToAdd = standardRoles.filter(name => !existingNames.has(name.toLowerCase()));

                if (rolesToAdd.length === 0) return; // All exist

                // Add missing roles
                rolesToAdd.forEach((name, index) => {
                    // Order logic: append after existing? Or just use index?
                    // Standard init is usually for empty teams. 
                    // If merging, maybe set order to existing.length + index?
                    // Let's keep it simple: just add them. Order might be mixed if we just add.
                    // To be safe on order, we could fetch max order.
                    // But for now, ensuring no duplicates is priority.
                    const newRoleRef = rolesRef.doc();
                    // We use standardRoles index for order preference, but it might conflict if we append.
                    // A better way for initialization is:
                    transaction.set(newRoleRef, { id: newRoleRef.id, teamId, name, order: 100 + index });
                });
            });
        } catch (e) {
            console.error("Failed to initialize standard roles:", e);
        }
    }

    async addDefaultMember(teamId: string, roleId: string, memberId: string): Promise<void> {
        await firestore
            .collection("teams")
            .doc(teamId)
            .collection("serving_roles")
            .doc(roleId)
            .update({
                default_members: arrayUnion(memberId)
            });
    }

    async removeDefaultMember(teamId: string, roleId: string, memberId: string): Promise<void> {
        await firestore
            .collection("teams")
            .doc(teamId)
            .collection("serving_roles")
            .doc(roleId)
            .update({
                default_members: arrayRemove(memberId)
            });
    }

    async cleanupMember(teamId: string, memberId: string): Promise<void> {
        try {
            const rolesSnapshot = await firestore
                .collection("teams")
                .doc(teamId)
                .collection("serving_roles")
                .where("default_members", "array-contains", memberId)
                .get();

            const batch = firestore.batch();
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

            // Fetch both Timestamp and String for transition period
            const [tsSnapshot, strSnapshot] = await Promise.all([
                firestore
                    .collection("teams")
                    .doc(teamId)
                    .collection("serving_schedules")
                    .where("date", ">=", Timestamp.fromDate(startD))
                    .where("date", "<=", Timestamp.fromDate(endD))
                    .get(),
                firestore
                    .collection("teams")
                    .doc(teamId)
                    .collection("serving_schedules")
                    .where("date", ">=", startDate)
                    .where("date", "<=", endDate)
                    .get()
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

    async getRecentSchedules(teamId: string, limit: number = 5): Promise<ServingSchedule[]> {
        try {
            const snapshot = await firestore.collection("teams").doc(teamId).collection("serving_schedules")
                .orderBy("date", "desc")
                .limit(limit)
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServingSchedule));
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async getRecentSchedulesByTag(teamId: string, tag: string, limit: number = 10): Promise<ServingSchedule[]> {
        try {
            const snapshot = await firestore
                .collection("teams")
                .doc(teamId)
                .collection("serving_schedules")
                .where("service_tags", "array-contains", tag)
                .orderBy("date", "desc")
                .limit(limit)
                .get();
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

            const [tsSnapshot, strSnapshot] = await Promise.all([
                firestore
                    .collection("teams")
                    .doc(teamId)
                    .collection("serving_schedules")
                    .where("date", ">=", Timestamp.fromDate(startD))
                    .where("date", "<", Timestamp.fromDate(nextD))
                    .limit(1)
                    .get(),
                firestore
                    .collection("teams")
                    .doc(teamId)
                    .collection("serving_schedules")
                    .where("date", "==", date)
                    .limit(1)
                    .get()
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
            const doc = await firestore
                .collection("teams")
                .doc(teamId)
                .collection("serving_schedules")
                .doc(scheduleId)
                .get();

            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() } as ServingSchedule;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async createSchedule(teamId: string, schedule: Omit<ServingSchedule, "id">): Promise<ServingSchedule> {
        const ref = firestore.collection("teams").doc(teamId).collection("serving_schedules").doc();

        const normalizedDate = typeof schedule.date === 'string' ? parseLocalDate(schedule.date) : schedule.date.toDate();
        normalizedDate.setHours(12, 0, 0, 0); // Normalize to local noon

        const newSchedule = {
            ...schedule,
            id: ref.id,
            date: Timestamp.fromDate(normalizedDate)
        };
        await ref.set(newSchedule);
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
        const docRef = firestore.collection("teams").doc(teamId).collection("serving_schedules").doc(schedule.id);
        const oldDoc = await docRef.get();
        const oldData = oldDoc.data() as ServingSchedule | undefined;

        const normalizedDate = typeof schedule.date === 'string' ? parseLocalDate(schedule.date) : (schedule.date as Timestamp).toDate();
        normalizedDate.setHours(12, 0, 0, 0);

        const updatedSchedule = {
            ...schedule,
            date: Timestamp.fromDate(normalizedDate)
        };

        await docRef.set(updatedSchedule, { merge: true });

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

        const docRef = firestore.collection("teams").doc(teamId).collection("serving_schedules").doc(scheduleId);
        const docSnapshot = await docRef.get();
        const data = docSnapshot.data() as ServingSchedule | undefined;

        // Remove stats before deletion
        if (data && data.service_tags && data.service_tags.length > 0 && data.date) {
            await this.updateTagStats(teamId, data.service_tags, data.date, "remove");
        }

        await docRef.delete();
    }

    // --- Templates ---

    async getTemplates(teamId: string): Promise<any[]> {
        try {
            const snapshot = await firestore
                .collection("teams")
                .doc(teamId)
                .collection("serving_templates")
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async createTemplate(teamId: string, template: any): Promise<void> {
        const ref = firestore.collection("teams").doc(teamId).collection("serving_templates").doc();
        await ref.set({ ...template, id: ref.id });
    }

    async updateTemplate(teamId: string, templateId: string, template: any): Promise<void> {
        await firestore.collection("teams").doc(teamId).collection("serving_templates").doc(templateId).update(template);
    }

    async deleteTemplate(teamId: string, templateId: string): Promise<void> {
        await firestore.collection("teams").doc(teamId).collection("serving_templates").doc(templateId).delete();
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
        const snapshot = await firestore
            .collection("teams")
            .doc(teamId)
            .collection("serving_roles")
            .where("name", "==", name)
            .limit(1)
            .get();
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ServingRole;
    }

    // --- Config (Custom Groups & Members) ---

    async getServingConfig(teamId: string): Promise<{ customGroups: string[], customNames: string[] }> {
        try {
            const doc = await firestore
                .collection("teams")
                .doc(teamId)
                .collection("serving_config")
                .doc("general")
                .get();
            if (!doc.exists) return { customGroups: [], customNames: [] };
            const data = doc.data();
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
        await firestore
            .collection("teams")
            .doc(teamId)
            .collection("serving_config")
            .doc("general")
            .set({ custom_groups: arrayUnion(groupName) }, { merge: true });
    }

    async addCustomMemberName(teamId: string, name: string): Promise<void> {
        await firestore
            .collection("teams")
            .doc(teamId)
            .collection("serving_config")
            .doc("general")
            .set({ custom_names: arrayUnion(name) }, { merge: true });
    }

    // --- Tag Stats (Advanced Smart Quick Select) ---

    async getTagStats(teamId: string): Promise<Record<string, { count: number, weekdays: Record<string, number>, last_used_at: any }>> {
        try {
            const doc = await firestore
                .collection("teams")
                .doc(teamId)
                .collection("config")
                .doc("tag_stats")
                .get();

            if (!doc.exists) return {};
            return doc.data()?.stats || {};
        } catch (e) {
            console.error("Failed to fetch tag stats", e);
            return {};
        }
    }

    async updateTagStats(teamId: string, tagIds: string[], dateString: string, mode: "add" | "remove"): Promise<void> {
        try {
            const statsRef = firestore.collection("teams").doc(teamId).collection("config").doc("tag_stats");
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
            // Since we are updating specific keys in the 'stats' map, we need to be careful.
            // set({ stats: statsUpdate }, { merge: true }) works for creating/merging top 'stats' field.
            // However, it will REPLACE the 'stats' map's children if we are not careful? 
            // NO, `set` with `merge:true` performs a deep merge on Maps.
            // So `stats: { tagId: { count: ... } }` will merge into `stats`.

            await statsRef.set({ stats: statsUpdate }, { merge: true });
        } catch (e) {
            console.error("Failed to update tag stats", e);
        }
    }
}

export default ServingService.getInstance();
