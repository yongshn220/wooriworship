import {atom, atomFamily, selector, selectorFamily} from "recoil";
import {Song} from "@/models/song";
import {SongService} from "@/apis";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {useMemo} from "react";
import {searchSelectedTagsAtom, songSearchInputAtom} from "@/app/board/_states/board-states";

export const currentTeamSongIdsAtom = atomFamily<Array<string>, string>({
  key: "currentTeamSongIdsAtom",
  default: selectorFamily({
    key: "currentTeamSongIdsAtom/default",
    get: (teamId) => async ({get}) => {
      if (!teamId) return []

      try {
        const songList = await SongService.getTeamSong(teamId)
        if (!songList) return []

        const searchInput = get(songSearchInputAtom)
        const selectedTags = get(searchSelectedTagsAtom)

        let filtered = songList.filter((song) => song.title.toLowerCase().includes(searchInput.toLowerCase()))
        filtered = filtered.filter((song) => song.tags.some((tag: string) => selectedTags.includes(tag) || selectedTags.length === 0))
        return filtered.map((song) => song.id)
      }
      catch (e) {
        console.log(e)
        return []
      }
    }
  })
})

export const testAtom = atomFamily<string, string>({
  key: "testAtom",
  default: selectorFamily({
    key: "testAtom/default",
    get: () => async () => {
      return "test"
    }
  })
})


export const songSelector = selectorFamily({
  key: "songAtom/default",
  get: (songId) => async ({get}) => {
    get(songUpdaterAtom)
    try {
      const song = await SongService.getById(songId) as Song
      if (!song) return null

      return song
    } catch (e) {
      console.log(e)
      return null
    }
  }
})

export const songAtom = atomFamily<Song, string>({
  key: "songAtom",
  default: selectorFamily({
    key: "songAtom/default",
    get: (songId: string) => async ({get}) => {
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
