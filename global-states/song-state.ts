import {atom, atomFamily, selectorFamily} from "recoil";
import {Song} from "@/models/song";
import {SongService} from "@/apis";

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
