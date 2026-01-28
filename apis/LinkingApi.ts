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
     * Atomically links a Worship Plan and a Serving Schedule.
     * Updates both documents to reference each other.
     */
    async linkWorshipAndServing(teamId: string, worshipId: string, servingId: string): Promise<boolean> {
        if (!teamId || !worshipId || !servingId) {
            console.error("linkWorshipAndServing: Missing required parameters", { teamId, worshipId, servingId });
            return false;
        }

        const worshipRef = doc(db, "teams", teamId, "worships", worshipId);
        const servingRef = doc(db, "teams", teamId, "services", servingId);

        try {
            await runTransaction(db, async (transaction) => {
                const worshipDoc = await transaction.get(worshipRef);
                const servingDoc = await transaction.get(servingRef);

                if (!worshipDoc.exists() || !servingDoc.exists()) {
                    throw new Error("One or both documents do not exist.");
                }

                transaction.update(worshipRef, { serving_schedule_id: servingId });
                transaction.update(servingRef, { worship_id: worshipId });
            });
            return true;
        } catch (e) {
            console.error("Failed to link documents:", e);
            return false;
        }
    }

    /**
     * Atomically unlinks a Worship Plan from its Serving Schedule.
     * Finds the related Serving Schedule and removes the reference to this Worship Plan.
     */
    async unlinkWorship(teamId: string, worshipId: string): Promise<boolean> {
        const worshipRef = doc(db, "teams", teamId, "worships", worshipId);

        try {
            await runTransaction(db, async (transaction) => {
                const worshipDoc = await transaction.get(worshipRef);
                if (!worshipDoc.exists()) return;

                const data = worshipDoc.data();
                const servingId = data?.serving_schedule_id;

                if (servingId) {
                    const servingRef = doc(db, "teams", teamId, "services", servingId);
                    const servingDoc = await transaction.get(servingRef);
                    if (servingDoc.exists() && servingDoc.data()?.worship_id === worshipId) {
                        transaction.update(servingRef, { worship_id: null });
                    }
                }

                transaction.update(worshipRef, { serving_schedule_id: null });
            });
            return true;
        } catch (e) {
            console.error("Failed to unlink worship:", e);
            return false;
        }
    }

    /**
     * Atomically unlinks a Serving Schedule from its Worship Plan.
     */
    async unlinkServing(teamId: string, servingId: string): Promise<boolean> {
        const servingRef = doc(db, "teams", teamId, "services", servingId);

        try {
            await runTransaction(db, async (transaction) => {
                const servingDoc = await transaction.get(servingRef);
                if (!servingDoc.exists()) return;

                const data = servingDoc.data();
                const worshipId = data?.worship_id;

                if (worshipId) {
                    const worshipRef = doc(db, "teams", teamId, "worships", worshipId);
                    const worshipDoc = await transaction.get(worshipRef);
                    if (worshipDoc.exists() && worshipDoc.data()?.serving_schedule_id === servingId) {
                        transaction.update(worshipRef, { serving_schedule_id: null });
                    }
                }

                transaction.update(servingRef, { worship_id: null });
            });
            return true;
        } catch (e) {
            console.error("Failed to unlink serving:", e);
            return false;
        }
    }

    /**
     * Cleans up references before deleting a Worship document.
     * This ensures no dangling pointer remains in Serving Schedule.
     */
    async cleanupReferencesForWorshipDeletion(teamId: string, worshipId: string): Promise<void> {
        await this.unlinkWorship(teamId, worshipId);
    }

    /**
     * Cleans up references before deleting a Serving Schedule document.
     */
    async cleanupReferencesForServingDeletion(teamId: string, servingId: string): Promise<void> {
        await this.unlinkServing(teamId, servingId);
    }
}

export default LinkingApi.getInstance();
