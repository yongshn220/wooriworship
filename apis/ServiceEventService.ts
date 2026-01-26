import { db } from "@/firebase";
import {
    collection, doc, getDoc, getDocs,
    query, where, orderBy, Timestamp,
    writeBatch, setDoc, updateDoc,
    DocumentSnapshot
} from "firebase/firestore";
import { ServiceEvent, ServiceSetlist, ServiceBand, ServiceFlow } from "@/models/services/ServiceEvent";

export class ServiceEventService {

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
        return snapshot.docs.map(doc => doc.data() as ServiceEvent);
    }

    /**
     * Fetches full details for a single service (Lazy Load).
     * Reads Header + Setlist + Band + Flow in parallel.
     */
    static async getServiceDetails(teamId: string, serviceId: string) {
        const serviceRef = doc(db, `teams/${teamId}/services/${serviceId}`);
        const setlistRef = doc(serviceRef, 'setlists', 'main');
        const bandRef = doc(serviceRef, 'bands', 'main');
        const flowRef = doc(serviceRef, 'flows', 'main');

        const [serviceSnap, setlistSnap, bandSnap, flowSnap] = await Promise.all([
            getDoc(serviceRef),
            getDoc(setlistRef),
            getDoc(bandRef),
            getDoc(flowRef)
        ]);

        if (!serviceSnap.exists()) return null;

        return {
            event: serviceSnap.data() as ServiceEvent,
            setlist: setlistSnap.exists() ? setlistSnap.data() as ServiceSetlist : null,
            band: bandSnap.exists() ? bandSnap.data() as ServiceBand : null,
            flow: flowSnap.exists() ? flowSnap.data() as ServiceFlow : null
        };
    }

    // =========================================================================
    // 2. Writing (Create / Update)
    // =========================================================================

    /**
     * Creates a new Service (Header + Empty Sub-collections).
     */
    static async createService(teamId: string, data: Partial<ServiceEvent>) {
        const newDocRef = doc(collection(db, `teams/${teamId}/services`));
        const serviceId = newDocRef.id;

        const batch = writeBatch(db);

        // 1. Header
        const now = Timestamp.now();
        const eventData: ServiceEvent = {
            id: serviceId,
            teamId,
            date: data.date || now,
            title: data.title || "New Service",
            service_tags: data.service_tags || [],
            created_at: now,
            updated_at: now,
            summary: { songCount: 0 }
        };
        batch.set(newDocRef, eventData);

        // 2. Init Empty Sub-docs (Optional, but good for consistency)
        batch.set(doc(newDocRef, 'setlists', 'main'), { id: 'main', songs: [] });
        batch.set(doc(newDocRef, 'bands', 'main'), { id: 'main', roles: [] });
        batch.set(doc(newDocRef, 'flows', 'main'), { id: 'main', items: [] });

        await batch.commit();
        return serviceId;
    }

    /**
     * Updates ONLY the Setlist (Songs).
     */
    static async updateSetlist(teamId: string, serviceId: string, data: Partial<ServiceSetlist>) {
        const ref = doc(db, `teams/${teamId}/services/${serviceId}/setlists/main`);
        await setDoc(ref, data, { merge: true });

        // Optional: Update Summary in Header (songCount)
        if (data.songs) {
            const headerRef = doc(db, `teams/${teamId}/services/${serviceId}`);
            await updateDoc(headerRef, { 'summary.songCount': data.songs.length });
        }
    }

    /**
     * Updates ONLY the Band (Roles).
     */
    static async updateBand(teamId: string, serviceId: string, data: Partial<ServiceBand>) {
        const ref = doc(db, `teams/${teamId}/services/${serviceId}/bands/main`);
        await setDoc(ref, data, { merge: true });
    }

    /**
     * Updates ONLY the Flow (Items).
     */
    static async updateFlow(teamId: string, serviceId: string, data: Partial<ServiceFlow>) {
        const ref = doc(db, `teams/${teamId}/services/${serviceId}/flows/main`);
        await setDoc(ref, data, { merge: true });
    }
}
