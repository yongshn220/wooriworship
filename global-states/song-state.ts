import { atom, atomFamily, selectorFamily } from "recoil";
import { Song } from "@/models/song";
import { SongApi } from "@/apis";
import { searchSelectedTagsAtom, searchSelectedKeysAtom, songBoardSelectedSortOptionAtom, songSearchInputAtom } from "@/app/board/_states/board-states";
import { SongBoardSortOption } from "@/components/constants/enums";
import { getInitialChar } from "@/components/util/helper/helper-functions";


export const songIdsAtom = atomFamily<Array<string>, string>({
  key: "songIdsAtom",
  default: selectorFamily({
    key: "songIdsAtom/default",
    get: (teamId: string) => async ({ get }) => {
      if (!teamId) return []

      try {
        const songIds = await SongApi.getSongIds(teamId)
        if (!songIds) return []

        return songIds
      }
      catch (e) {
        console.error(e)
        return []
      }
    }
  })
})

// Raw unfiltered song list - single source of truth for all songs
const allTeamSongsAtom = selectorFamily<Array<Song>, string>({
  key: "allTeamSongsAtom",
  get: (teamId) => async ({ get }) => {
    get(songUpdaterAtom)
    if (!teamId) return []
    try {
      const songList = await SongApi.getSong(teamId) as Song[]
      return songList ?? []
    } catch (e) {
      console.error(e)
      return []
    }
  }
})

// New: Returns the full sorted list of Song objects
export const currentTeamSortedSongsAtom = selectorFamily<Array<Song>, string>({
  key: "currentTeamSortedSongsAtom",
  get: (teamId) => ({ get }) => {
    if (!teamId) return []

    let songList = [...get(allTeamSongsAtom(teamId))]
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
      songList = songList.filter((song) => song?.tags?.some((tag: string) => selectedTags.includes(tag)))
    }

    // Key Filter
    const selectedKeys = get(searchSelectedKeysAtom)
    if (selectedKeys && selectedKeys.length > 0) {
      songList = songList.filter((song) => song?.keys && song.keys.some(key => selectedKeys.includes(key)))
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

export const songAtom = atomFamily<Song, { teamId: string, songId: string }>({
  key: "songAtom",
  default: selectorFamily({
    key: "songAtom/default",
    get: ({ teamId, songId }) => async ({ get }) => {
      if (!teamId || !songId) return null

      // Try to find song in cached list first
      const allSongs = get(allTeamSongsAtom(teamId))
      const cachedSong = allSongs.find(song => song.id === songId)
      if (cachedSong) return cachedSong

      // Fall back to individual API call if not found (e.g., direct URL access)
      try {
        const song = await SongApi.getSongById(teamId, songId) as Song
        if (!song) return null

        return song
      }
      catch (e) {
        console.error(e)
        return null
      }
    }
  })
})

export const songUpdaterAtom = atom({
  key: "songUpdaterAtom",
  default: 0
})

export const teamUniqueKeysSelector = selectorFamily<Array<string>, string>({
  key: "teamUniqueKeysSelector",
  get: (teamId) => ({ get }) => {
    if (!teamId) return []

    const songList = get(allTeamSongsAtom(teamId))
    if (!songList) return []

    const allKeys = new Set<string>()
    songList.forEach(song => {
      song.keys?.forEach(key => allKeys.add(key))
    })
    return Array.from(allKeys).sort()
  }
})
