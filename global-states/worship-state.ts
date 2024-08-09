import {atom, atomFamily, selectorFamily} from "recoil";
import {Worship} from "@/models/worship";
import {WorshipService} from "@/apis";
import {Song} from "@/models/song";
import {songAtom} from "@/global-states/song-state";

export const currentTeamWorshipIdsAtom = atomFamily<Array<string>, string>({
  key: "currentTeamWorshipIdsAtom",
  default: selectorFamily({
    key: "currentTeamWorshipIdsAtom/default",
    get: (teamId) => async ({get}) => {
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

        return worshipList.map((worship => worship.id))
      }
      catch (e) {
        console.log(e)
        return []
      }
    }
  })
})

export const worshipIdsUpdaterAtom = atom({
  key: "worshipIdsUpdaterAtom",
  default: 0
})


export const worshipAtom = atomFamily<Worship, string>({
  key: "worshipAtom",
  default: selectorFamily({
    key: "worshipAtom/default",
    get: (worshipId) => async ({get}) => {
      get(worshipUpdaterAtom)
      try {
        const worship = await WorshipService.getById(worshipId) as Worship
        if (!worship) return null

        return worship
      }
      catch (e) {
        console.log(e)
        return null
      }
    }
  })
})

export const resetWorshipState = (set: any) => {
  set(worshipAtom, null)
}

export const worshipUpdaterAtom = atom({
  key: "worshipUpdaterAtom",
  default: 0
})


export const worshipSongListAtom = atomFamily<Array<Song>, string>({
  key: "worshipSongListAtom",
  default: selectorFamily({
    key: "worshipSongListAtom/default",
    get: (worshipId: string) => async ({get}) => {
      get(worshipSongUpdaterAtom)
      try {
        const worship = get(worshipAtom(worshipId))
        if (!worship) {
          console.log("Worship is not exists."); return []
        }

        const songListPromise = worship.songs?.map(song => get(songAtom(song.id)))
        if (!songListPromise) {
          console.log("Fail while loading song list promises."); return []
        }

        const songList = await Promise.all(songListPromise)
        if (!songList) {
          console.log(("Fail while loading song lists.")); return []
        }

        return songList
      }
      catch (e) {
        console.log(e)
        return []
      }
    }
  })
})

export const resetWorshipSongListState = (set: any) => {
  set(worshipSongListAtom, [])
}

export const worshipSongUpdaterAtom = atom({
  key: "worshipSongUpdaterAtom",
  default: 0
})

