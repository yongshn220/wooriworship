import {atom, atomFamily, selector, selectorFamily} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {SongService, WorshipService} from "@/apis";
import {Worship} from "@/models/worship";
import {Song} from "@/models/song";
import {songAtom} from "@/app/board/[teamId]/song/_states/song-board-states";


export const currentTeamWorshipIdsAtom = atom<Array<string>>({
  key: "currentTeamWorshipIdsAtom",
  default: selector({
    key: "currentTeamWorshipIdsAtom/default",
    get: async ({get}) => {
      try {
        const teamId = get(currentTeamIdAtom)
        if (!teamId) return []

        const worshipList = await WorshipService.getTeamWorship(teamId)
        if (!worshipList) return []

        return worshipList.map((worship => worship.id))
      }
      catch (e) {
        console.log(e)
        return []
      }
    }
  })
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
        if (!worship) return []

        const songListPromise = worship.songs.map(song => get(songAtom(song.id)))
        const songList = await Promise.all(songListPromise)
        if (!songList) return []

        return songList
      }
      catch (e) {
        console.log(e)
        return []
      }
    }
  })
})

export const worshipSongUpdaterAtom = atom({
  key: "worshipSongUpdaterAtom",
  default: 0
})
