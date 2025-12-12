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

        const currentRoles = await this.getRoles(teamId);
        if (currentRoles.length > 0) return; // Already initialized

        const batch = firestore.batch();
        const collectionRef = firestore.collection("teams").doc(teamId).collection("serving_roles");

        standardRoles.forEach((name, index) => {
            const ref = collectionRef.doc();
            const newRole = { id: ref.id, teamId, name, order: index };
            batch.set(ref, newRole);
        });

        await batch.commit();
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
}

export default ServingService.getInstance();
