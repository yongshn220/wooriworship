import {atom, atomFamily, selector, selectorFamily} from "recoil";
import {SongService} from "@/apis";
import {currentTeamIdAtom} from "@/global-states/teamState";


export const currentTeamSongIdsAtom = atom<Array<string>>({
  key: "currentTeamSongIdsAtom",
  default: selector({
    key: "currentTeamSongIdsAtom/default",
    get: async ({get}) => {
      try {
        const teamId = get(currentTeamIdAtom)
        if (!teamId) return []

        const songList = await SongService.getTeamSong(teamId)
        if (!songList) return []

        return songList.map(song => song.id)
      }
      catch (e) {
        console.log(e)
        return []
      }
    }
  })
})

