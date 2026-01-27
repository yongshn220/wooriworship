import { db } from "@/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { ServiceSetlist } from "@/models/services/ServiceEvent";
import { Song } from "@/models/song";
import SongService from "./SongService";

/**
 * SetlistService (V3)
 * Handles setlists for services: teams/{teamId}/services/{serviceId}/setlists/main
 */
export class SetlistService {

    /**
     * Fetches the setlist for a specific service.
     */
    static async getSetlist(teamId: string, serviceId: string): Promise<ServiceSetlist | null> {
        if (!teamId || !serviceId) return null;
        try {
            const ref = doc(db, `teams/${teamId}/services/${serviceId}/setlists/main`);
            const snap = await getDoc(ref);
            if (!snap.exists()) return null;

            const data = snap.data() as ServiceSetlist;

            // Hydrate Songs
            if (data.songs && data.songs.length > 0) {
                const hydratedSongs = await Promise.all(data.songs.map(async (s) => {
                    // Start with lightweight hydration if possible, or fetch full song
                    // Optimization: Could use a cache or batched fetch
                    const songDetails = await SongService.getSongById(teamId, s.id) as Song;
                    return {
                        ...s,
                        title: songDetails?.title || "Unknown Song",
                        artist: songDetails?.original?.author || songDetails?.subtitle || "",
                        key: songDetails?.keys?.[0] || ""
                    };
                }));
                data.songs = hydratedSongs;
            }

            return data;
        } catch (e) {
            console.error("SetlistService.getSetlist:", e);
            return null;
        }
    }

    /**
     * Updates the setlist for a specific service.
     * Also updates song usage stats via SongService.
     */
    static async updateSetlist(teamId: string, serviceId: string, data: Partial<ServiceSetlist>) {
        if (!teamId || !serviceId) return;

        try {
            const ref = doc(db, `teams/${teamId}/services/${serviceId}/setlists/main`);

            // If songs are updated, track usage
            if (data.songs) {
                const songIds = data.songs.map(s => s.id);
                if (data.beginning_song?.id) songIds.push(data.beginning_song.id);
                if (data.ending_song?.id) songIds.push(data.ending_song.id);

                const uniqueIds = Array.from(new Set(songIds));
                const promises = uniqueIds.map(id => SongService.utilizeSong(teamId, id));
                await Promise.all(promises);
            }

            await setDoc(ref, {
                ...data,
                id: 'main',
                updated_at: Timestamp.now()
            }, { merge: true });
        } catch (e) {
            console.error("SetlistService.updateSetlist:", e);
            throw e;
        }
    }

    /**
     * Clears or initializes an empty setlist.
     */
    static async initSetlist(teamId: string, serviceId: string) {
        const ref = doc(db, `teams/${teamId}/services/${serviceId}/setlists/main`);
        await setDoc(ref, { id: 'main', songs: [] });
    }
}
