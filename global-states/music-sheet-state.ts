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
        get(musicSheetIdsUpdaterAtom)

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

export const musicSheetIdsUpdaterAtom = atom({
  key: "musicSheetIdsUpdaterAtom",
  default: 0
})

export const musicSheetsBySongIdAtom = atomFamily<Array<MusicSheet>, string>({
  key: "musicSheetsAtom",
  default: selectorFamily({
    key: "musicSheetsAtom/default",
    get: (songId: string) => async ({get}) => {
      try {
        if (!songId) return []

        const musicSheetIds =  get(musicSheetIdsAtom(songId))
        if (!musicSheetIds) {
          console.log("err:musicSheetsBySongIdAtom. musicSheetIds not exists"); return []
        }

        const musicSheetListPromise = musicSheetIds?.map(id => get(musicSheetAtom(id)))
        if (!musicSheetListPromise) {
          console.log("err:musicSheetsBySongIdAtom. musicSheetListPromise not exists"); return []
        }

        const songMusicSheetList = await Promise.all(musicSheetListPromise)
        if (!songMusicSheetList) {
          console.log("err:musicSheetsBySongIdAtom. songMusicSheetList not exists"); return []
        }

        return songMusicSheetList
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
