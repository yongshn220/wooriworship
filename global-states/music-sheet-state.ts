import { atom, atomFamily, selectorFamily } from "recoil";
import { MusicSheet } from "@/models/music_sheet";
import MusicSheetApi from "@/apis/MusicSheetApi";


export const musicSheetIdsAtom = atomFamily<Array<string>, { teamId: string, songId: string }>({
  key: "musicSheetIdsAtom",
  default: selectorFamily({
    key: "musicSheetIdsAtom/default",
    get: ({ teamId, songId }) => async ({ get }) => {
      if (!songId || !teamId) return []
      try {
        get(musicSheetIdsUpdaterAtom)

        const musicSheetList = await MusicSheetApi.getSongMusicSheets(teamId, songId)
        if (!musicSheetList) return []

        return musicSheetList?.map(sheet => sheet.id)
      }
      catch (e) {
        console.error(e)
        return []
      }
    }
  })
})

export const musicSheetIdsUpdaterAtom = atom({
  key: "musicSheetIdsUpdaterAtom",
  default: 0
})

export const musicSheetsBySongIdAtom = atomFamily<Array<MusicSheet>, { teamId: string, songId: string }>({
  key: "musicSheetsAtom",
  default: selectorFamily({
    key: "musicSheetsAtom/default",
    get: ({ teamId, songId }) => ({ get }) => {
      if (!songId || !teamId) return []

      const musicSheetIds = get(musicSheetIdsAtom({ teamId, songId }))
      if (!musicSheetIds) return []

      return musicSheetIds.map(id => get(musicSheetAtom({ teamId, songId, sheetId: id })))
    }
  })
})

export const musicSheetsByIdsAtom = atomFamily<Array<MusicSheet>, { teamId: string, songId: string, ids: Array<string> }>({
  key: "musicSheetsByIdsAtom",
  default: selectorFamily({
    key: "musicSheetsByIdsAtom/default",
    get: ({ teamId, songId, ids }) => ({ get }) => {
      if (!ids || ids.length === 0) return []

      return ids.map(id => get(musicSheetAtom({ teamId, songId, sheetId: id })))
    }
  })
})


export const musicSheetAtom = atomFamily<MusicSheet, { teamId: string, songId: string, sheetId: string }>({
  key: "musicSheetAtom",
  default: selectorFamily({
    key: "musicSheetAtom/default",
    get: ({ teamId, songId, sheetId }) => async ({ get }) => {
      get(musicSheetUpdaterAtom)
      try {
        const musicSheet = await MusicSheetApi.getById(teamId, songId, sheetId) as MusicSheet
        if (!musicSheet) return null

        return musicSheet
      }
      catch (e) {
        console.error(e)
        return null
      }
    }
  })
})

export const musicSheetUpdaterAtom = atom({
  key: "musicSheetUpdaterAtom",
  default: 0
})
