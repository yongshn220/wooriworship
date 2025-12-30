import BaseService from "./BaseService";
import { ServingRole, ServingSchedule } from "@/models/serving";
import { firestore } from "@/firebase";
import { arrayRemove, arrayUnion } from "@firebase/firestore";
import LinkingService from "./LinkingService";

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
        const initFlagRef = firestore.collection("teams").doc(teamId).collection("system").doc("serving_init");

        try {
            await firestore.runTransaction(async (transaction) => {
                const initDoc = await transaction.get(initFlagRef);
                if (initDoc.exists) return; // Already initialized

                // Create standard roles
                standardRoles.forEach((name, index) => {
                    const newRoleRef = rolesRef.doc();
                    transaction.set(newRoleRef, { id: newRoleRef.id, teamId, name, order: index });
                });

                // Mark as initialized
                transaction.set(initFlagRef, { initializedAt: new Date().toISOString() });
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
            const snapshot = await firestore
                .collection("teams")
                .doc(teamId)
                .collection("serving_schedules")
                .where("date", ">=", startDate)
                .where("date", "<=", endDate)
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServingSchedule));
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
            const snapshot = await firestore
                .collection("teams")
                .doc(teamId)
                .collection("serving_schedules")
                .where("date", "==", date)
                .get();

            if (snapshot.empty) return null;
            const doc = snapshot.docs[0];
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
        const newSchedule = { ...schedule, id: ref.id };
        await ref.set(newSchedule);
        if (schedule.worship_id) {
            await LinkingService.linkWorshipAndServing(teamId, schedule.worship_id, newSchedule.id);
        }
        return newSchedule;
    }

    async updateSchedule(teamId: string, schedule: ServingSchedule): Promise<void> {
        await firestore
            .collection("teams")
            .doc(teamId)
            .collection("serving_schedules")
            .doc(schedule.id)
            .set(schedule, { merge: true });
    }

    async deleteSchedule(teamId: string, scheduleId: string): Promise<void> {
        await LinkingService.cleanupReferencesForServingDeletion(teamId, scheduleId);
        await firestore
            .collection("teams")
            .doc(teamId)
            .collection("serving_schedules")
            .doc(scheduleId)
            .delete();
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
}

export default ServingService.getInstance();
