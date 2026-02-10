import { atom, selectorFamily } from "recoil";
import { DirectionType, SetlistViewPageMode } from "@/components/constants/enums";
import { musicSheetsByIdsAtom } from "@/global-states/music-sheet-state";
import { setlistAtom } from "@/global-states/setlist-state";
import { SetlistSongHeader } from "@/models/setlist";

export const setlistLiveOptionsAtom = atom({
    key: 'worshipLiveOptionsAtom',
    default: {
        showSongNote: true,
        showSongNumber: true
    }
})

export const setlistMultipleSheetsViewModeAtom = atom<DirectionType>({
    key: 'worshipMultipleSheetsViewModeAtom',
    default: DirectionType.VERTICAL
})

export const setlistViewPageModeAtom = atom<SetlistViewPageMode>({
    key: 'worshipViewPageModeAtom',
    default: SetlistViewPageMode.SINGLE_PAGE
})

export const setlistIndexAtom = atom({
    key: 'worshipIndexAtom',
    default: {
        current: 0,
        total: 0
    }
})

export const setlistIndexChangeEventAtom = atom<{ page: number; timestamp: number }>({
    key: 'worshipIndexChangeEventAtom',
    default: { page: 0, timestamp: Date.now() }
})

export const setlistNoteAtom = atom<string>({
    key: 'worshipNoteAtom',
    default: ""
})

export const setlistUIVisibilityAtom = atom<boolean>({
    key: 'worshipUIVisibilityAtom',
    default: true
})

export interface FlatPage {
    teamId: string
    songId: string
    sheetId: string
    pageIndex: number
    url: string
    globalIndex: number
}

export const setlistFlatPagesSelector = selectorFamily<
  FlatPage[],
  { teamId: string, serviceId: string }
>({
  key: 'setlistFlatPagesSelector',
  get: ({ teamId, serviceId }) => ({ get }) => {
    // 1. Setlist 가져오기
    const setlist = get(setlistAtom({ teamId, setlistId: serviceId }))
    if (!setlist) return []

    // 2. 모든 곡 수집 (beginning + songs + ending)
    const allSongHeaders: SetlistSongHeader[] = []
    if (setlist.beginning_song?.id) {
      allSongHeaders.push(setlist.beginning_song)
    }
    if (setlist.songs) {
      allSongHeaders.push(...setlist.songs)
    }
    if (setlist.ending_song?.id) {
      allSongHeaders.push(setlist.ending_song)
    }

    // 3. 각 곡의 악보를 flat하게 펼침
    const flatPages: FlatPage[] = []
    let globalIndex = 0

    for (const songHeader of allSongHeaders) {
      // 선택된 악보들 가져오기
      const sheets = get(musicSheetsByIdsAtom({
        teamId,
        songId: songHeader.id,
        ids: songHeader.selected_music_sheet_ids || []
      }))

      // 각 악보의 각 페이지를 flatPages에 추가
      for (const sheet of sheets) {
        if (!sheet?.urls || sheet.urls.length === 0) continue

        for (let pageIndex = 0; pageIndex < sheet.urls.length; pageIndex++) {
          flatPages.push({
            teamId,
            songId: songHeader.id,
            sheetId: sheet.id || "",
            pageIndex,
            url: sheet.urls[pageIndex],
            globalIndex: globalIndex++
          })
        }
      }
    }

    return flatPages
  }
})
