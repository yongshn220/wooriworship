import {atom, atomFamily, selectorFamily} from "recoil";
import {MusicSheet} from "@/models/music_sheet";
import MusicSheetService from "@/apis/MusicSheetService";


export const musicSheetIdsAtom = atomFamily<Array<string>, string>({
  key: "musicSheetIdsAtom",
  default: selectorFamily({
    key: "musicSheetIdsAtom/default",
    get: (songId: string) => async ({get}) => {
      if (!songId) return []

      try {
        const musicSheetList = await MusicSheetService.getByFilters([{a: 'song_id', b: '==', c: songId}]) as Array<MusicSheet>
        if (!musicSheetList) return []

        return musicSheetList?.map(sheet => sheet.id)
      }
      catch (e) {
        console.log(e)
        return []
      }
    }
  })
})


export const musicSheetAtom = atomFamily<MusicSheet, string>({
  key: "musicSheetAtom",
  default: selectorFamily({
    key: "musicSheetAtom/default",
    get: (musicSheetId) => async ({get}) => {
      get(musicSheetUpdaterAtom)
      try {
        const musicSheet = await MusicSheetService.getById(musicSheetId) as MusicSheet
        if (!musicSheet) return null

        return musicSheet
      }
      catch (e) {
        console.log(e)
        return null
      }
    }
  })
})

export const musicSheetUpdaterAtom = atom({
  key: "musicSheetUpdaterAtom",
  default: 0
})
