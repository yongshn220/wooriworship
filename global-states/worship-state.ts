import { atom, atomFamily, selectorFamily, RecoilState } from "recoil";
import { Worship } from "@/models/worship";
import { WorshipService } from "@/apis";
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

        const worshipList = await WorshipService.getTeamWorship(teamId) as Array<Worship>
        if (!worshipList) return []

        worshipList.sort((a, b) => {
          try {
            const dateA = a?.worship_date?.toDate().getTime() || 0;
            const dateB = b?.worship_date?.toDate().getTime() || 0;
            return dateB - dateA;
          } catch (e) {
            return 0;
          }
        });

        return worshipList
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

export const worshipAtom = (globalForRecoil.recoilAtoms['worshipAtom'] || atomFamily<Worship, string>({
  key: "worshipAtom",
  default: selectorFamily({
    key: "worshipAtom/default",
    get: (worshipId) => async ({ get }) => {
      get(worshipUpdaterAtom)
      try {
        const worship = await WorshipService.getById(worshipId) as Worship
        if (!worship) return null

        return worship
      }
      catch (e) {
        console.error(e)
        return null
      }
    }
  })
})) as typeof worshipAtomType;

if (process.env.NODE_ENV !== 'production') globalForRecoil.recoilAtoms['worshipAtom'] = worshipAtom

export const worshipUpdaterAtom = atom({
  key: "worshipUpdaterAtom",
  default: 0
})


// Helper type for typescript
const worshipSongListAtomType = atomFamily<Array<Song>, string>({} as any);

export const worshipSongListAtom = (globalForRecoil.recoilAtoms['worshipSongListAtom'] || atomFamily<Array<Song>, string>({
  key: "worshipSongListAtom",
  default: selectorFamily({
    key: "worshipSongListAtom/default",
    get: (worshipId: string) => async ({ get }) => {
      get(worshipSongUpdaterAtom)
      try {
        const worship = get(worshipAtom(worshipId))
        if (!worship) {
          console.error("Worship is not exists."); return []
        }

        const songListPromise = worship.songs?.map(song => get(songAtom(song.id)))
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
})) as typeof worshipSongListAtomType;

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
