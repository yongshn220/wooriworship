import { db } from "@/firebase";
import {
    collection, doc, getDoc, getDocs, setDoc, deleteDoc,
    updateDoc, query, orderBy, where, writeBatch,
    arrayUnion, arrayRemove, Timestamp
} from "firebase/firestore";
import { ServiceRole, ServiceAssignment, ServicePraiseTeam } from "@/models/services/ServiceEvent";

/**
 * PraiseTeamApi (V3)
 * Handles:
 * 1. Global Role Configuration: teams/{teamId}/praise_team_roles
 * 2. Service-specific Assignees: teams/{teamId}/services/{serviceId}/praise_assignee/main
 */
export class PraiseTeamApi {

    // =========================================================================
    // 1. Role Configuration (teams/{teamId}/praise_team_roles)
    // =========================================================================

    static async getRoles(teamId: string): Promise<ServiceRole[]> {
        try {
            const q = query(
                collection(db, "teams", teamId, "praise_team_roles"),
                orderBy("order", "asc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceRole));
        } catch (e) {
            console.error("PraiseTeamApi.getRoles:", e);
            return [];
        }
    }

    static async createRole(teamId: string, role: Omit<ServiceRole, "id">): Promise<ServiceRole> {
        const ref = doc(collection(db, "teams", teamId, "praise_team_roles"));
        const newRole = { ...role, id: ref.id };
        await setDoc(ref, newRole);
        return newRole;
    }

    static async updateRole(teamId: string, role: ServiceRole): Promise<void> {
        const ref = doc(db, "teams", teamId, "praise_team_roles", role.id);
        await setDoc(ref, role, { merge: true });
    }

    static async deleteRole(teamId: string, roleId: string): Promise<void> {
        const ref = doc(db, "teams", teamId, "praise_team_roles", roleId);
        await deleteDoc(ref);
    }

    static async updateRolesOrder(teamId: string, roles: ServiceRole[]): Promise<void> {
        const batch = writeBatch(db);
        roles.forEach((role, index) => {
            const docRef = doc(db, "teams", teamId, "praise_team_roles", role.id);
            batch.update(docRef, { order: index });
        });
        await batch.commit();
    }

    static async addDefaultMember(teamId: string, roleId: string, memberId: string): Promise<void> {
        const ref = doc(db, "teams", teamId, "praise_team_roles", roleId);
        await updateDoc(ref, {
            default_members: arrayUnion(memberId)
        });
    }

    static async removeDefaultMember(teamId: string, roleId: string, memberId: string): Promise<void> {
        const ref = doc(db, "teams", teamId, "praise_team_roles", roleId);
        await updateDoc(ref, {
            default_members: arrayRemove(memberId)
        });
    }

    // =========================================================================
    // 2. Service-specific Praise Team (teams/{teamId}/services/{serviceId}/praise_team/main)
    // =========================================================================

    static async getPraiseTeam(teamId: string, serviceId: string): Promise<ServicePraiseTeam | null> {
        if (!teamId || !serviceId) return null;
        try {
            const ref = doc(db, `teams/${teamId}/services/${serviceId}/praise_team/main`);
            const snap = await getDoc(ref);
            if (!snap.exists()) return null;
            return snap.data() as ServicePraiseTeam;
        } catch (e) {
            console.error("PraiseTeamApi.getPraiseTeam:", e);
            return null;
        }
    }

    static async updatePraiseTeam(teamId: string, serviceId: string, data: Partial<ServicePraiseTeam>) {
        if (!teamId || !serviceId) return;
        const ref = doc(db, `teams/${teamId}/services/${serviceId}/praise_team/main`);
        await setDoc(ref, {
            ...data,
            id: 'main',
            updated_at: Timestamp.now()
        }, { merge: true });
    }

    static async initPraiseTeam(teamId: string, serviceId: string) {
        const ref = doc(db, `teams/${teamId}/services/${serviceId}/praise_team/main`);
        await setDoc(ref, { id: 'main', assignments: [] });
    }

    // =========================================================================
    // 3. Configuration (Custom Groups & Names)
    // =========================================================================

    static async addCustomGroup(teamId: string, groupName: string): Promise<void> {
        const ref = doc(db, "teams", teamId, "service_config", "general");
        await setDoc(ref, { custom_groups: arrayUnion(groupName) }, { merge: true });
    }

    static async addCustomMemberName(teamId: string, name: string): Promise<void> {
        const ref = doc(db, "teams", teamId, "service_config", "general");
        await setDoc(ref, { custom_names: arrayUnion(name) }, { merge: true });
    }

    static async getServiceConfig(teamId: string): Promise<{ customGroups: string[], customNames: string[] }> {
        const docRef = doc(db, "teams", teamId, "service_config", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                customGroups: data.custom_groups || [],
                customNames: data.custom_names || []
            };
        }
        return { customGroups: [], customNames: [] };
    }

    static async initStandardRoles(teamId: string): Promise<void> {
        const standardRoles = ["인도", "드럼", "베이스", "건반", "싱어", "엔지니어", "자막"];
        try {
            const rolesRef = collection(db, "teams", teamId, "praise_team_roles");
            const existingSnapshot = await getDocs(rolesRef);
            const existingNames = new Set(existingSnapshot.docs.map(doc => (doc.data().name as string).toLowerCase()));

            const rolesToAdd = standardRoles.filter(name => !existingNames.has(name.toLowerCase()));
            if (rolesToAdd.length === 0) return;

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

    static async cleanupMember(teamId: string, memberId: string): Promise<void> {
        try {
            const q = query(
                collection(db, "teams", teamId, "praise_team_roles"),
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

    static async deletePraiseTeam(teamId: string, serviceId: string) {
        const ref = doc(db, `teams/${teamId}/services/${serviceId}/praise_team/main`);
        await deleteDoc(ref);
    }
}
