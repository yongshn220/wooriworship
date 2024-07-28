import {atom, atomFamily, selectorFamily} from "recoil";
import {Song} from "@/models/song";
import {SongService} from "@/apis";
import {
  searchSelectedTagsAtom,
  songBoardSelectedSortOptionAtom,
  songSearchInputAtom
} from "@/app/board/_states/board-states";
import {SongBoardSortOption} from "@/components/constants/enums";
import {worshipAtom} from "@/global-states/worship-state";
import songService from "@/apis/SongService";

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


export const testAtom = atomFamily<string, string>({
  key: "testAtom",
  default: selectorFamily({
    key: "testAtom/default",
    get: () => async () => {
      return "test"
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

export const songsByWorshipIdAtom = atomFamily<Array<Song>, string>({
  key: "songsByWorshipIdAtom",
  default: selectorFamily({
    key: "songsByWorshipIdAtom/default",
    get: (worshipId) => async ({get}) => {
      try {
        const worship = get(worshipAtom(worshipId))
        if (!worship) return []

        const songPromises = worship.songs.map(songHeader => SongService.getById(songHeader.id))
        const songs = await Promise.all(songPromises) as Song[]

        return songs.filter(Boolean)
      }
      catch (e) {
        return []
      }
    }
  })
})

export const songUpdaterAtom = atom({
  key: "songUpdaterAtom",
  default: 0
})
