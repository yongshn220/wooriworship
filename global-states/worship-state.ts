import { atom, atomFamily, selectorFamily, RecoilState } from "recoil";
import { Worship } from "@/models/worship";
import { ServiceEventService } from "@/apis/ServiceEventService";
import { SetlistService } from "@/apis/SetlistService";
import { Song } from "@/models/song";
import { songAtom } from "@/global-states/song-state";

// Workaround for Next.js HMR Duplicate Atom Key
const globalForRecoil = global as unknown as { recoilAtoms: Record<string, any> };
if (!globalForRecoil.recoilAtoms) globalForRecoil.recoilAtoms = {};

const currentTeamWorshipIdsAtomType = atomFamily<Array<string>, string>({} as any);

export const currentTeamWorshipListAtom = (globalForRecoil.recoilAtoms['currentTeamWorshipListAtom'] || atomFamily<Array<Worship>, string>({
  key: "currentTeamWorshipListAtom",
  default: selectorFamily({
    key: "currentTeamWorshipListAtom/default",
    get: (teamId) => async ({ get }) => {
      if (!teamId) return []

      try {
        get(worshipIdsUpdaterAtom)

        const services = await ServiceEventService.getServiceEvents(teamId)
        if (!services) return []

        // Map to legacy Worship shape for UI compatibility
        const worships: Array<Worship> = services.map(s => ({
          id: s.id,
          title: s.title,
          service_tags: s.service_tags || [],
          worship_date: s.date,
          // Placeholder values for legacy shape (details will be fetched via worshipAtom if needed)
          description: "",
          link: "",
          songs: [],
          beginning_song: { id: null, note: "", selected_music_sheet_ids: [] },
          ending_song: { id: null, note: "", selected_music_sheet_ids: [] },
        } as unknown as Worship));

        return worships
      }
      catch (e) {
        console.error(e)
        return []
      }
    }
  })
})) as (param: string) => RecoilState<Array<Worship>>;

if (process.env.NODE_ENV !== 'production') globalForRecoil.recoilAtoms['currentTeamWorshipListAtom'] = currentTeamWorshipListAtom


export const currentTeamWorshipIdsAtom = (globalForRecoil.recoilAtoms['currentTeamWorshipIdsAtom'] || atomFamily<Array<string>, string>({
  key: "currentTeamWorshipIdsAtom",
  default: selectorFamily({
    key: "currentTeamWorshipIdsAtom/default",
    get: (teamId) => ({ get }) => {
      const worshipList = get(currentTeamWorshipListAtom(teamId) as any) as Array<Worship>;
      return worshipList.map(w => w.id as string);
    }
  })
})) as typeof currentTeamWorshipIdsAtomType;

if (process.env.NODE_ENV !== 'production') globalForRecoil.recoilAtoms['currentTeamWorshipIdsAtom'] = currentTeamWorshipIdsAtom

export const worshipIdsUpdaterAtom = atom({
  key: "worshipIdsUpdaterAtom",
  default: 0
})



// Helper type for typescript
const worshipAtomType = atomFamily<Worship, string>({} as any);

export const worshipAtom = (globalForRecoil.recoilAtoms['worshipAtom'] || atomFamily<Worship, { teamId: string, worshipId: string }>({
  key: "worshipAtom",
  default: selectorFamily({
    key: "worshipAtom/default",
    get: ({ teamId, worshipId }) => async ({ get }) => {
      get(worshipUpdaterAtom)
      try {
        const details = await ServiceEventService.getServiceDetails(teamId, worshipId)
        if (!details) return null

        // Map details to legacy Worship shape
        const worship: Worship = {
          id: details.event.id,
          title: details.event.title,
          description: details.setlist?.description || "",
          link: details.setlist?.link || "",
          service_tags: details.event.service_tags || [],
          songs: details.setlist?.songs || [],
          beginning_song: details.setlist?.beginning_song || { id: null, note: "", selected_music_sheet_ids: [] },
          ending_song: details.setlist?.ending_song || { id: null, note: "", selected_music_sheet_ids: [] },
          worship_date: details.event.date,
          serving_schedule_id: details.event.id, // V3 is unified
        } as unknown as Worship;

        return worship
      }
      catch (e) {
        console.error(e)
        return null
      }
    }
  })
})) as unknown as (param: { teamId: string, worshipId: string }) => RecoilState<Worship>;

if (process.env.NODE_ENV !== 'production') globalForRecoil.recoilAtoms['worshipAtom'] = worshipAtom

export const worshipUpdaterAtom = atom({
  key: "worshipUpdaterAtom",
  default: 0
})


// Helper type for typescript
const worshipSongListAtomType = atomFamily<Array<Song>, string>({} as any);

export const worshipSongListAtom = (globalForRecoil.recoilAtoms['worshipSongListAtom'] || atomFamily<Array<Song>, { teamId: string, worshipId: string }>({
  key: "worshipSongListAtom",
  default: selectorFamily({
    key: "worshipSongListAtom/default",
    get: ({ teamId, worshipId }) => async ({ get }) => {
      get(worshipSongUpdaterAtom)
      try {
        const worship = get(worshipAtom({ teamId, worshipId }))
        if (!worship) {
          console.error("Worship is not exists."); return []
        }

        const songListPromise = worship.songs?.map(song => get(songAtom({ teamId, songId: song.id })))
        if (!songListPromise) {
          console.error("Fail while loading song-board list promises."); return []
        }

        const songList = await Promise.all(songListPromise)
        if (!songList) {
          console.error(("Fail while loading song-board lists.")); return []
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
})) as unknown as (param: { teamId: string, worshipId: string }) => RecoilState<Array<Song>>;

if (process.env.NODE_ENV !== 'production') globalForRecoil.recoilAtoms['worshipSongListAtom'] = worshipSongListAtom

export const worshipSongUpdaterAtom = atom({
  key: "worshipSongUpdaterAtom",
  default: 0
})

export const currentWorshipIdAtom = atom<string>({
  key: "currentWorshipIdAtom",
  default: null
})

export const worshipListDisplayedCountAtom = atom({
  key: "worshipListDisplayedCountAtom",
  default: 5
})
