import { db } from "@/firebase";
import {
    collection, doc, getDoc, getDocs, setDoc, deleteDoc,
    updateDoc, Timestamp
} from "firebase/firestore";
import { ServiceFlowItem, ServiceFlow } from "@/models/services/ServiceEvent";

/**
 * ServiceFlowService (V3)
 * Handles:
 * 1. Service-specific Flow: teams/{teamId}/services/{serviceId}/flows/main
 * 2. Global Flow Templates: teams/{teamId}/serving_templates
 */
export class ServiceFlowService {

    // =========================================================================
    // 1. Service-specific Flow (teams/{teamId}/services/{serviceId}/flows/main)
    // =========================================================================

    static async getFlow(teamId: string, serviceId: string): Promise<ServiceFlow | null> {
        if (!teamId || !serviceId) return null;
        try {
            const ref = doc(db, `teams/${teamId}/services/${serviceId}/flows/main`);
            const snap = await getDoc(ref);
            if (!snap.exists()) return null;
            return snap.data() as ServiceFlow;
        } catch (e) {
            console.error("ServiceFlowService.getFlow:", e);
            return null;
        }
    }

    static async updateFlow(teamId: string, serviceId: string, data: Partial<ServiceFlow>) {
        if (!teamId || !serviceId) return;
        const ref = doc(db, `teams/${teamId}/services/${serviceId}/flows/main`);
        await setDoc(ref, {
            ...data,
            id: 'main',
            updated_at: Timestamp.now()
        }, { merge: true });
    }

    static async initFlow(teamId: string, serviceId: string) {
        const ref = doc(db, `teams/${teamId}/services/${serviceId}/flows/main`);
        await setDoc(ref, { id: 'main', items: [] });
    }

    // =========================================================================
    // 2. Flow Templates (teams/{teamId}/serving_templates)
    // =========================================================================

    static async getTemplates(teamId: string): Promise<any[]> {
        try {
            const snapshot = await getDocs(collection(db, "teams", teamId, "serving_templates"));
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("ServiceFlowService.getTemplates:", e);
            return [];
        }
    }

    static async createTemplate(teamId: string, template: any): Promise<void> {
        const ref = doc(collection(db, "teams", teamId, "serving_templates"));
        await setDoc(ref, { ...template, id: ref.id });
    }

    static async updateTemplate(teamId: string, templateId: string, template: any): Promise<void> {
        const ref = doc(db, "teams", teamId, "serving_templates", templateId);
        await updateDoc(ref, template);
    }

    static async deleteTemplate(teamId: string, templateId: string): Promise<void> {
        const ref = doc(db, "teams", teamId, "serving_templates", templateId);
        await deleteDoc(ref);
    }

    static async initDefaultTemplate(teamId: string): Promise<void> {
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

        try {
            const templates = await this.getTemplates(teamId);
            if (templates.length > 0) return;

            const defaultTemplate = {
                name: "예배",
                teamId,
                items: SAMPLE_FLOW.map(i => ({
                    title: i.title,
                    type: i.type as any,
                    remarks: "",
                    assignments: []
                }))
            };
            await this.createTemplate(teamId, defaultTemplate);
        } catch (e) {
            console.error("Failed to initialize default template:", e);
        }
    }
}
