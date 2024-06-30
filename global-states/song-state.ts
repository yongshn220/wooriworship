import {atom, atomFamily, selectorFamily} from "recoil";
import {Song} from "@/models/song";
import {SongService} from "@/apis";
import {
  searchSelectedTagsAtom,
  songBoardSelectedSortOptionAtom,
  songSearchInputAtom
} from "@/app/board/_states/board-states";
import {SongBoardSortOption} from "@/components/constants/enums";

export const currentTeamSongIdsAtom = atomFamily<Array<string>, string>({
  key: "currentTeamSongIdsAtom",
  default: selectorFamily({
    key: "currentTeamSongIdsAtom/default",
    get: (teamId) => async ({get}) => {
      if (!teamId) return []

      try {
        const songList = await SongService.getTeamSong(teamId) as Song[]
        if (!songList) return []

        const searchInput = get(songSearchInputAtom)
        const selectedTags = get(searchSelectedTagsAtom)

        // Search Filter
        let modified = songList.filter((song) => song.title.toLowerCase().includes(searchInput.toLowerCase()))
        // Tag Filter
        modified = modified.filter((song) => song.tags.some((tag: string) => selectedTags.includes(tag) || selectedTags.length === 0))
        // Sort
        switch (get(songBoardSelectedSortOptionAtom)) {
          case SongBoardSortOption.TITLE_ASCENDING:
            modified = modified.sort((a, b) => a.title.localeCompare(b.title));
            break;
          case SongBoardSortOption.TITLE_DESCENDING:
            modified = modified.sort((a, b) => b.title.localeCompare(a.title));
            break;
          case SongBoardSortOption.LAST_USED_DATE_ASCENDING:
            modified = modified.sort((a, b) => (a.last_used_time ?? 0) - (b.last_used_time ?? 0));
            break;
          case SongBoardSortOption.LAST_USED_DATE_DESCENDING:
            modified = modified.sort((a, b) => (b.last_used_time ?? 0) - (a.last_used_time ?? 0));
            break;
        }

        return modified.map((song) => song.id)
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
