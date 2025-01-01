import {atom, atomFamily, selectorFamily} from "recoil";
import {Song} from "@/models/song";
import {SongService} from "@/apis";
import {searchSelectedTagsAtom,songBoardSelectedSortOptionAtom,songSearchInputAtom} from "@/app/board/_states/board-states";
import {SongBoardSortOption} from "@/components/constants/enums";


export const currentTeamSongIdsAtom = atomFamily<Array<string>, string>({
  key: "currentTeamSongIdsAtom",
  default: selectorFamily({
    key: "currentTeamSongIdsAtom/default",
    get: (teamId) => async ({get}) => {
      if (!teamId) return []

      try {
        let songList = await SongService.getTeamSong(teamId) as Song[]
        if (!songList) return []

        const searchInput = get(songSearchInputAtom)
        const selectedTags = get(searchSelectedTagsAtom)

        // Search Filter
        if (searchInput && searchInput !== "") {
          songList = songList.filter((song) => song?.title?.toLowerCase().includes(searchInput.toLowerCase()))
        }
        // Tag Filter
        if (selectedTags && selectedTags.length > 0) {
          songList = songList.filter((song) =>  song?.tags?.length === 0 || song?.tags?.some((tag: string) => selectedTags.includes(tag) || selectedTags.length === 0))
        }

        // Sort
        switch (get(songBoardSelectedSortOptionAtom)) {
          case SongBoardSortOption.TITLE_ASCENDING:
            songList = songList.sort((a, b) => a?.title?.localeCompare(b?.title));
            break;
          case SongBoardSortOption.TITLE_DESCENDING:
            songList = songList.sort((a, b) => b?.title?.localeCompare(a?.title));
            break;
          case SongBoardSortOption.LAST_USED_DATE_ASCENDING:
            songList = songList.sort((a, b) => Number(a?.last_used_time || 0) - Number(b?.last_used_time || 0))
            break;
          case SongBoardSortOption.LAST_USED_DATE_DESCENDING:
            songList = songList.sort((a, b) => Number(b?.last_used_time || 0) - Number(a?.last_used_time || 0))
            break;
        }

        return songList.map((song) => song.id)
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
