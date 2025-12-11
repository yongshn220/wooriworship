import { atom } from "recoil";
import { DirectionType, WorshipViewPageMode } from "@/components/constants/enums";

export const worshipLiveOptionsAtom = atom({
    key: 'worshipLiveOptionsAtom',
    default: {
        showSongNote: true,
        showSongNumber: true
    }
})

export const worshipMultipleSheetsViewModeAtom = atom<DirectionType>({
    key: 'worshipMultipleSheetsViewModeAtom',
    default: DirectionType.VERTICAL
})

export const worshipViewPageModeAtom = atom<WorshipViewPageMode>({
    key: 'worshipViewPageModeAtom',
    default: WorshipViewPageMode.SINGLE_PAGE
})

export const worshipIndexAtom = atom({
    key: 'worshipIndexAtom',
    default: {
        current: 0,
        total: 0
    }
})

export const worshipIndexChangeEventAtom = atom<number>({
    key: 'worshipIndexChangeEventAtom',
    default: 0
})

export const worshipNoteAtom = atom<string>({
    key: 'worshipNoteAtom',
    default: ""
})

export const worshipUIVisibilityAtom = atom<boolean>({
    key: 'worshipUIVisibilityAtom',
    default: true
})
