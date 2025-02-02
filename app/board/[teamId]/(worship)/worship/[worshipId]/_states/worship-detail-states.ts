import {atom} from "recoil";
import {DirectionType, WorshipViewPageMode} from "@/components/constants/enums";


export const worshipLiveOptionsAtom = atom({
  key: "worshipLiveOptionsAtom",
  default: {
    showSongNote: true,
    showSongNumber: true,
  }
})
export const worshipMultipleSheetsViewModeAtom = atom<DirectionType>({
  key: "worshipMultipleSheetsViewModeAtom",
  default: DirectionType.VERTICAL
})

export const worshipViewPageModeAtom = atom<WorshipViewPageMode>({
  key: "worshipViewPageModeAtom",
  default: WorshipViewPageMode.SINGLE_PAGE
})

export const worshipIndexAtom = atom({
  key: "worshipIndexAtom",
  default: {
    total: 0,
    current: 0,
  }
})

export const worshipIndexChangeEventAtom = atom({
  key: "worshipIndexChangeEventAtom",
  default: 0
})

