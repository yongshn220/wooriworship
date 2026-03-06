import { atom, atomFamily, selectorFamily, RecoilState } from "recoil";
import { Setlist } from "@/models/setlist";
import { ServiceEventApi } from "@/apis/ServiceEventApi";
import { Song } from "@/models/song";
import { songAtom } from "@/global-states/song-state";

// Workaround for Next.js HMR Duplicate Atom Key
const globalForRecoil = global as unknown as { recoilAtoms: Record<string, any> };
if (!globalForRecoil.recoilAtoms) globalForRecoil.recoilAtoms = {};

const currentTeamSetlistIdsAtomType = atomFamily<Array<string>, string>({} as any);

export const currentTeamSetlistListAtom = (globalForRecoil.recoilAtoms['currentTeamSetlistListAtom'] || atomFamily<Array<Setlist>, string>({
  key: "currentTeamSetlistListAtom",
  default: selectorFamily({
    key: "currentTeamSetlistListAtom/default",
    get: (teamId) => async ({ get }) => {
      if (!teamId) return []

      try {
        get(setlistIdsUpdaterAtom)

        const services = await ServiceEventApi.getRecentServicesWithFlows(teamId) as any[]
        if (!services) return []

        // Map to Setlist shape for UI compatibility
        const setlists: Array<Setlist> = services.map(s => ({
          id: s.id,
          title: s.title,
          service_tags: s.tagId ? [s.tagId] : [],
          worship_date: s.date, // Legacy field name kept for backwards compatibility
          // Placeholder values (details will be fetched via setlistAtom if needed)
          description: "",
          link: "",
          songs: [],
          beginning_song: { id: null, note: "", selected_music_sheet_ids: [] },
          ending_song: { id: null, note: "", selected_music_sheet_ids: [] },
        } as unknown as Setlist));

        return setlists
      }
      catch (e) {
        console.error(e)
        return []
      }
    }
  })
})) as (param: string) => RecoilState<Array<Setlist>>;

if (process.env.NODE_ENV !== 'production') globalForRecoil.recoilAtoms['currentTeamSetlistListAtom'] = currentTeamSetlistListAtom


export const currentTeamSetlistIdsAtom = (globalForRecoil.recoilAtoms['currentTeamSetlistIdsAtom'] || atomFamily<Array<string>, string>({
  key: "currentTeamSetlistIdsAtom",
  default: selectorFamily({
    key: "currentTeamSetlistIdsAtom/default",
    get: (teamId) => ({ get }) => {
      const setlistList = get(currentTeamSetlistListAtom(teamId) as any) as Array<Setlist>;
      return setlistList.map(s => s.id as string);
    }
  })
})) as typeof currentTeamSetlistIdsAtomType;

if (process.env.NODE_ENV !== 'production') globalForRecoil.recoilAtoms['currentTeamSetlistIdsAtom'] = currentTeamSetlistIdsAtom

export const setlistIdsUpdaterAtom = atom({
  key: "setlistIdsUpdaterAtom",
  default: 0
})



// Helper type for typescript
const setlistAtomType = atomFamily<Setlist, string>({} as any);

export const setlistAtom = (globalForRecoil.recoilAtoms['setlistAtom'] || atomFamily<Setlist, { teamId: string, setlistId: string }>({
  key: "setlistAtom",
  default: selectorFamily({
    key: "setlistAtom/default",
    get: ({ teamId, setlistId }) => async ({ get }) => {
      get(setlistUpdaterAtom)
      try {
        const details = await ServiceEventApi.getServiceDetails(teamId, setlistId)
        if (!details) return null

        // Map details to Setlist shape
        const setlist: Setlist = {
          id: details.event.id,
          title: details.event.title,
          description: details.setlist?.description || "",
          link: details.setlist?.link || "",
          service_tags: details.event.tagId ? [details.event.tagId] : [],
          songs: details.setlist?.songs || [],
          beginning_song: details.setlist?.beginning_song || { id: null, note: "", selected_music_sheet_ids: [] },
          ending_song: details.setlist?.ending_song || { id: null, note: "", selected_music_sheet_ids: [] },
          worship_date: details.event.date, // Legacy field name
          serving_schedule_id: details.event.id, // V3 is unified
        } as unknown as Setlist;

        return setlist
      }
      catch (e) {
        console.error(e)
        return null
      }
    }
  })
})) as unknown as (param: { teamId: string, setlistId: string }) => RecoilState<Setlist>;

if (process.env.NODE_ENV !== 'production') globalForRecoil.recoilAtoms['setlistAtom'] = setlistAtom

export const setlistUpdaterAtom = atom({
  key: "setlistUpdaterAtom",
  default: 0
})


// Helper type for typescript
const setlistSongListAtomType = atomFamily<Array<Song>, string>({} as any);

export const setlistSongListAtom = (globalForRecoil.recoilAtoms['setlistSongListAtom'] || atomFamily<Array<Song>, { teamId: string, setlistId: string }>({
  key: "setlistSongListAtom",
  default: selectorFamily({
    key: "setlistSongListAtom/default",
    get: ({ teamId, setlistId }) => async ({ get }) => {
      get(setlistSongUpdaterAtom)
      try {
        const setlist = get(setlistAtom({ teamId, setlistId }))
        if (!setlist) {
          console.error("Setlist does not exist."); return []
        }

        const songListPromise = setlist.songs?.map(song => get(songAtom({ teamId, songId: song.id })))
        if (!songListPromise) {
          console.error("Failed to load song list promises."); return []
        }

        const songList = await Promise.all(songListPromise)
        if (!songList) {
          console.error("Failed to load song lists."); return []
        }

        return songList
      }
      catch (e) {
        if (e instanceof Promise) throw e;
        console.error(e)
        return []
      }
    }
  })
})) as unknown as (param: { teamId: string, setlistId: string }) => RecoilState<Array<Song>>;

if (process.env.NODE_ENV !== 'production') globalForRecoil.recoilAtoms['setlistSongListAtom'] = setlistSongListAtom

export const setlistSongUpdaterAtom = atom({
  key: "setlistSongUpdaterAtom",
  default: 0
})

export const currentSetlistIdAtom = atom<string>({
  key: "currentSetlistIdAtom",
  default: null
})

export const setlistListDisplayedCountAtom = atom({
  key: "setlistListDisplayedCountAtom",
  default: 5
})
