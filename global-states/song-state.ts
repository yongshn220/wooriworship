import { atom, atomFamily, selectorFamily } from "recoil";
import { Song } from "@/models/song";
import { SongService } from "@/apis";
import { searchSelectedTagsAtom, songBoardSelectedSortOptionAtom, songSearchInputAtom } from "@/app/board/_states/board-states";
import { SongBoardSortOption } from "@/components/constants/enums";
import { getInitialChar } from "@/components/util/helper/helper-functions";


export const songIdsAtom = atomFamily<Array<string>, string>({
  key: "songIdsAtom",
  default: selectorFamily({
    key: "songIdsAtom/default",
    get: (teamId: string) => async ({ get }) => {
      if (!teamId) return []

      try {
        const songIds = await SongService.getSongIds(teamId)
        if (!songIds) return []

        return songIds
      }
      catch (e) {
        console.log(e)
        return []
      }
    }
  })
})

// New: Returns the full sorted list of Song objects
export const currentTeamSortedSongsAtom = selectorFamily<Array<Song>, string>({
  key: "currentTeamSortedSongsAtom",
  get: (teamId) => async ({ get }) => {
    if (!teamId) return []

    try {
      let songList = await SongService.getSong(teamId) as Song[]
      if (!songList) return []

      const searchInput = get(songSearchInputAtom)
      const selectedTags = get(searchSelectedTagsAtom)

      // Search Filter
      if (searchInput && searchInput !== "") {
        const normalizedSearchInput = searchInput.toLowerCase().replace(/\s+/g, '');
        songList = songList.filter((song) =>
          song?.title?.toLowerCase().replace(/\s+/g, '').includes(normalizedSearchInput) ||
          song?.subtitle?.toLowerCase().replace(/\s+/g, '').includes(normalizedSearchInput)
        )
      }
      // Tag Filter
      if (selectedTags && selectedTags.length > 0) {
        songList = songList.filter((song) => song?.tags?.length === 0 || song?.tags?.some((tag: string) => selectedTags.includes(tag) || selectedTags.length === 0))
      }

      // Sort
      const sortOption = get(songBoardSelectedSortOptionAtom);
      switch (sortOption) {
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

      return songList
    }
    catch (e) {
      console.log(e)
      return []
    }
  }
})

// Modified: Simply extracts IDs from the sorted list
export const currentTeamSongIdsAtom = selectorFamily<Array<string>, string>({
  key: "currentTeamSongIdsAtom",
  get: (teamId) => ({ get }) => {
    const songs = get(currentTeamSortedSongsAtom(teamId));
    return songs.map(song => song.id);
  }
})

// New: Helper to get the index map for Alphabet jumping
export const songAlphabetMapAtom = selectorFamily<Record<string, number>, string>({
  key: "songAlphabetMapAtom",
  get: (teamId) => ({ get }) => {
    const songs = get(currentTeamSortedSongsAtom(teamId));
    const sortOption = get(songBoardSelectedSortOptionAtom);

    // Only generate map if sorted by Title Ascending (A-Z)
    if (sortOption !== SongBoardSortOption.TITLE_ASCENDING) {
      return {};
    }

    const map: Record<string, number> = {};
    const seenChars = new Set<string>();

    songs.forEach((song, index) => {
      const char = getInitialChar(song.title);
      if (!seenChars.has(char)) {
        map[char] = index;
        seenChars.add(char);
      }
    });

    return map;
  }
})

export const songAtom = atomFamily<Song, string>({
  key: "songAtom",
  default: selectorFamily({
    key: "songAtom/default",
    get: (songId) => async ({ get }) => {
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
