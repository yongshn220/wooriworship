import {atom, atomFamily, selector, selectorFamily} from "recoil";
import {Song} from "@/models/song";
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




export const songAtom = atomFamily<Song, string>({
  key: "songAtom",
  default: selectorFamily({
    key: "songAtom/default",
    get: (songId) => async ({get}) => {
      get(songUpdaterAtom)
      try {
        const song = await SongService.getById(songId) as Song
        if (!song) return null

        return song
      }
      catch (e) {
        console.log(e)
        return null
      }
    }
  })
})

export const songUpdaterAtom = atom({
  key: "songUpdaterAtom",
  default: 0
})
