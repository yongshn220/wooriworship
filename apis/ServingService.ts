import BaseService from "./BaseService";
import { ServingRole, ServingSchedule } from "@/models/serving";
import { firestore } from "@/firebase";

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
        await firestore
            .collection("teams")
            .doc(teamId)
            .collection("serving_schedules")
            .doc(scheduleId)
            .delete();
    }
}

export default ServingService.getInstance();
