import { db } from "@/firebase";
import { doc, getDoc, setDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { ServiceSetlist } from "@/models/services/ServiceEvent";
import { Song } from "@/models/song";
import SongApi from "./SongApi";
import MusicSheetApi from "./MusicSheetApi";

/**
 * SetlistApi (V3)
 * Handles setlists for services: teams/{teamId}/services/{serviceId}/setlists/main
 */
export class SetlistApi {

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
                    const songDetails = await SongApi.getSongById(teamId, s.id) as Song;

                    // Get keys from all selected music sheets
                    const selectedKeys: string[] = [];
                    let selectedKeyNote = "";
                    if (s.selected_music_sheet_ids && s.selected_music_sheet_ids.length > 0) {
                        const sheets = await Promise.all(
                            s.selected_music_sheet_ids.map(sheetId =>
                                MusicSheetApi.getById(teamId, s.id, sheetId)
                            )
                        );
                        sheets.forEach(sheet => {
                            if (sheet?.key) selectedKeys.push(sheet.key);
                        });
                        selectedKeyNote = sheets[0]?.note || "";
                    }

                    return {
                        ...s,
                        title: songDetails?.title || "Unknown Song",
                        artist: songDetails?.original?.author || songDetails?.subtitle || "",
                        // Use keys from selected music sheets, fallback to song's first key
                        key: selectedKeys.length > 0 ? selectedKeys.join(" · ") : (songDetails?.keys?.[0] || ""),
                        keyNote: selectedKeyNote
                    };
                }));
                data.songs = hydratedSongs;
            }

            return data;
        } catch (e) {
            console.error("SetlistApi.getSetlist:", e);
            return null;
        }
    }

    /**
     * Updates the setlist for a specific service.
     * Also updates song usage stats via SongApi.
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
                const promises = uniqueIds.map(id => SongApi.utilizeSong(teamId, id));
                await Promise.all(promises);
            }

            // Filter out undefined values (Firebase doesn't allow undefined)
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([_, v]) => v !== undefined)
            );

            await setDoc(ref, {
                ...cleanData,
                id: 'main',
                updated_at: Timestamp.now()
            }, { merge: true });
        } catch (e) {
            console.error("SetlistApi.updateSetlist:", e);
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

    /**
     * Deletes the setlist for a specific service.
     */
    static async deleteSetlist(teamId: string, serviceId: string): Promise<void> {
        if (!teamId || !serviceId) return;
        const ref = doc(db, `teams/${teamId}/services/${serviceId}/setlists/main`);
        await deleteDoc(ref);
    }
}
