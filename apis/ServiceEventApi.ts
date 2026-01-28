import { db } from "@/firebase";
import {
    collection, doc, getDoc, getDocs,
    query, where, orderBy, Timestamp,
    writeBatch, setDoc, updateDoc, increment, limit
} from "firebase/firestore";
import { ServiceEvent } from "@/models/services/ServiceEvent";
import { SetlistApi } from "./SetlistApi";
import { PraiseTeamApi } from "./PraiseTeamApi";
import { ServiceFlowApi } from "./ServiceFlowApi";
import LinkingApi from "./LinkingApi";
import { parseLocalDate } from "@/components/util/helper/helper-functions";

/**
 * ServiceEventApi (V3 Orchestrator)
 * Manages the root Service document and coordinates sub-services (Setlist, Assignee, Flow).
 */
export class ServiceEventApi {

    // =========================================================================
    // 1. Fetching (Read)
    // =========================================================================

    /**
     * Fetches the list of Service Headers (Lightweight).
     * Used for the Calendar / Main Board view.
     */
    static async getServiceEvents(teamId: string, startDate: Date, endDate: Date): Promise<ServiceEvent[]> {
        const startTs = Timestamp.fromDate(startDate);
        const endTs = Timestamp.fromDate(endDate);

        const q = query(
            collection(db, `teams/${teamId}/services`),
            where("date", ">=", startTs),
            where("date", "<=", endTs),
            orderBy("date", "asc")
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceEvent));
    }

    /**
     * Fetches full details for a single service (Lazy Load).
     * Delegates to sub-services for deep data.
     */
    static async getServiceDetails(teamId: string, serviceId: string) {
        if (!teamId || !serviceId) return null;

        const serviceRef = doc(db, `teams/${teamId}/services/${serviceId}`);
        const serviceSnap = await getDoc(serviceRef);
        if (!serviceSnap.exists()) return null;

        const event = { id: serviceSnap.id, ...serviceSnap.data() } as ServiceEvent;

        const [setlist, praiseAssignee, flow] = await Promise.all([
            SetlistApi.getSetlist(teamId, serviceId),
            PraiseTeamApi.getPraiseTeam(teamId, serviceId),
            ServiceFlowApi.getFlow(teamId, serviceId)
        ]);

        return { event, setlist, praiseAssignee, flow };
    }

    // =========================================================================
    // 2. Writing (Create / Update / Delete)
    // =========================================================================

    /**
     * Creates a new Service (Header + Initializes Sub-collections).
     */
    static async createService(teamId: string, data: Partial<ServiceEvent>) {
        const newDocRef = doc(collection(db, `teams/${teamId}/services`));
        const serviceId = newDocRef.id;

        const now = Timestamp.now();
        const eventData: ServiceEvent = {
            id: serviceId,
            teamId,
            date: data.date || now,
            title: data.title || "New Service",
            tagId: data.tagId || "",
            created_at: now,
            updated_at: now,
            summary: { songCount: 0 }
        };

        if (data.setlist_id) {
            eventData.setlist_id = data.setlist_id;
        }

        await setDoc(newDocRef, eventData);

        // Initialize sub-collections
        await Promise.all([
            SetlistApi.initSetlist(teamId, serviceId),
            PraiseTeamApi.initPraiseTeam(teamId, serviceId),
            ServiceFlowApi.initFlow(teamId, serviceId)
        ]);

        return serviceId;
    }

    /**
     * Updates the Service Header.
     */
    static async updateService(teamId: string, serviceId: string, data: Partial<ServiceEvent>) {
        const ref = doc(db, `teams/${teamId}/services/${serviceId}`);

        // Safety check: remove undefined values
        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== undefined)
        );

        const updateData: any = { ...cleanData, updated_at: Timestamp.now() };

        await updateDoc(ref, updateData);
    }

    /**
     * Deletes a Service and its sub-collection documents.
     */
    /**
     * Deletes a Service and its sub-collection documents.
     */
    static async deleteService(teamId: string, serviceId: string) {
        // 1. Cleanup References (Linking)
        await LinkingApi.cleanupReferencesForServiceDeletion(teamId, serviceId);

        // 2. Delete Sub-docs (Explicitly)
        const batch = writeBatch(db);
        batch.delete(doc(db, `teams/${teamId}/services/${serviceId}/setlists/main`));
        batch.delete(doc(db, `teams/${teamId}/services/${serviceId}/praise_team/main`));
        batch.delete(doc(db, `teams/${teamId}/services/${serviceId}/flows/main`));

        // 3. Delete Header
        batch.delete(doc(db, `teams/${teamId}/services/${serviceId}`));

        await batch.commit();
    }

    static async initSubCollection(teamId: string, serviceId: string, type: 'setlist' | 'praise_team' | 'flow') {
        switch (type) {
            case 'setlist':
                await SetlistApi.initSetlist(teamId, serviceId);
                break;
            case 'praise_team':
                await PraiseTeamApi.initPraiseTeam(teamId, serviceId);
                break;
            case 'flow':
                await ServiceFlowApi.initFlow(teamId, serviceId);
                break;
        }
    }

    // =========================================================================
    // 4. Utility / History
    // =========================================================================

    static async getRecentServicesWithFlows(teamId: string, tagId?: string, limitCount: number = 10): Promise<any[]> {
        let q = query(
            collection(db, "teams", teamId, "services"),
            orderBy("date", "desc"),
            limit(limitCount)
        );

        if (tagId) {
            q = query(
                collection(db, "teams", teamId, "services"),
                where("tagId", "==", tagId),
                orderBy("date", "desc"),
                limit(limitCount)
            );
        }

        const snapshot = await getDocs(q);
        const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceEvent));

        const flows = await Promise.all(
            services.map(s => ServiceFlowApi.getFlow(teamId, s.id))
        );

        // Map to ServingSchedule-like shape for UI compatibility
        return services.map((s, idx) => ({
            ...s,
            worship_date: s.date, // Compatibility
            service_tag_ids: s.tagId ? [s.tagId] : [], // Compatibility
            items: flows[idx]?.items || []
        }));
    }

    static async getLegacyWorshipsByDate(teamId: string, date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const nextDay = new Date(startOfDay);
        nextDay.setDate(nextDay.getDate() + 1);

        const q = query(
            collection(db, `teams/${teamId}/worships`),
            where('worship_date', '>=', Timestamp.fromDate(startOfDay)),
            where('worship_date', '<', Timestamp.fromDate(nextDay))
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    }

    static async updateTagStats(teamId: string, tagIds: string[], dateString: string, mode: "add" | "remove"): Promise<void> {
        try {
            const statsRef = doc(db, "teams", teamId, "config", "tag_stats");
            const [y, m, d] = dateString.split('-').map(Number);
            const date = new Date(y, m - 1, d);
            const weekday = date.getDay().toString();
            const incrementValue = mode === "add" ? 1 : -1;

            const statsUpdate: any = {};
            for (const tagId of tagIds) {
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
            await setDoc(statsRef, { stats: statsUpdate }, { merge: true });
        } catch (e) {
            console.error("Failed to update tag stats", e);
        }
    }

    static async getServiceByDate(teamId: string, date: Date | string) {
        const d = typeof date === 'string' ? parseLocalDate(date) : date;
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);

        const services = await this.getServiceEvents(teamId, start, end);
        if (services.length === 0) return null;

        const details = await this.getServiceDetails(teamId, services[0].id);
        if (!details) return null;

        // Map to legacy shape for easier UI transition
        return {
            id: details.event.id,
            ...details.event,
            date: details.event.date,
            service_tags: details.event.tagId ? [details.event.tagId] : [],
            praise_team: details.praiseAssignee?.assignments || [],
            items: details.flow?.items || [],
        } as any;
    }

    static async getTagStats(teamId: string): Promise<Record<string, any>> {
        const statsRef = doc(db, "teams", teamId, "config", "tag_stats");
        const statsSnap = await getDoc(statsRef);
        if (statsSnap.exists()) {
            return statsSnap.data().stats || {};
        }
        return {};
    }
}
