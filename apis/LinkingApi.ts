import { db } from "@/firebase";
import { doc, collection, runTransaction } from "firebase/firestore";

class LinkingApi {
    private static instance: LinkingApi;

    private constructor() { }

    public static getInstance(): LinkingApi {
        if (!LinkingApi.instance) {
            LinkingApi.instance = new LinkingApi();
        }
        return LinkingApi.instance;
    }

    /**
     * Atomically links a Setlist and a Service.
     * Updates both documents to reference each other.
     */
    async linkSetlistAndService(teamId: string, setlistId: string, serviceId: string): Promise<boolean> {
        if (!teamId || !setlistId || !serviceId) {
            console.error("linkSetlistAndService: Missing required parameters", { teamId, setlistId, serviceId });
            return false;
        }

        const setlistRef = doc(db, "teams", teamId, "worships", setlistId);
        const serviceRef = doc(db, "teams", teamId, "services", serviceId);

        try {
            await runTransaction(db, async (transaction) => {
                const setlistDoc = await transaction.get(setlistRef);
                const serviceDoc = await transaction.get(serviceRef);

                if (!setlistDoc.exists() || !serviceDoc.exists()) {
                    throw new Error("One or both documents do not exist.");
                }

                transaction.update(setlistRef, { service_id: serviceId });
                transaction.update(serviceRef, { setlist_id: setlistId });
            });
            return true;
        } catch (e) {
            console.error("Failed to link documents:", e);
            return false;
        }
    }

    /**
     * Atomically unlinks a Setlist from its Service.
     * Finds the related Service and removes the reference to this Setlist.
     */
    async unlinkSetlist(teamId: string, setlistId: string): Promise<boolean> {
        const setlistRef = doc(db, "teams", teamId, "worships", setlistId);

        try {
            await runTransaction(db, async (transaction) => {
                const setlistDoc = await transaction.get(setlistRef);
                if (!setlistDoc.exists()) return;

                const data = setlistDoc.data();
                const serviceId = data?.service_id;

                if (serviceId) {
                    const serviceRef = doc(db, "teams", teamId, "services", serviceId);
                    const serviceDoc = await transaction.get(serviceRef);
                    if (serviceDoc.exists() && serviceDoc.data()?.setlist_id === setlistId) {
                        transaction.update(serviceRef, { setlist_id: null });
                    }
                }

                transaction.update(setlistRef, { service_id: null });
            });
            return true;
        } catch (e) {
            console.error("Failed to unlink setlist:", e);
            return false;
        }
    }

    /**
     * Atomically unlinks a Service from its Setlist.
     */
    async unlinkService(teamId: string, serviceId: string): Promise<boolean> {
        const serviceRef = doc(db, "teams", teamId, "services", serviceId);

        try {
            await runTransaction(db, async (transaction) => {
                const serviceDoc = await transaction.get(serviceRef);
                if (!serviceDoc.exists()) return;

                const data = serviceDoc.data();
                const setlistId = data?.setlist_id;

                if (setlistId) {
                    const setlistRef = doc(db, "teams", teamId, "worships", setlistId);
                    const setlistDoc = await transaction.get(setlistRef);
                    if (setlistDoc.exists() && setlistDoc.data()?.service_id === serviceId) {
                        transaction.update(setlistRef, { service_id: null });
                    }
                }

                transaction.update(serviceRef, { setlist_id: null });
            });
            return true;
        } catch (e) {
            console.error("Failed to unlink service:", e);
            return false;
        }
    }

    /**
     * Cleans up references before deleting a Setlist document.
     * This ensures no dangling pointer remains in Service.
     */
    async cleanupReferencesForSetlistDeletion(teamId: string, setlistId: string): Promise<void> {
        await this.unlinkSetlist(teamId, setlistId);
    }

    /**
     * Cleans up references before deleting a Service document.
     */
    async cleanupReferencesForServiceDeletion(teamId: string, serviceId: string): Promise<void> {
        await this.unlinkService(teamId, serviceId);
    }

}

export default LinkingApi.getInstance();
