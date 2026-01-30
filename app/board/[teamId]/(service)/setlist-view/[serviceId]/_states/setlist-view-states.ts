import { atom } from "recoil";
import { DirectionType, SetlistViewPageMode } from "@/components/constants/enums";

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

export const setlistIndexChangeEventAtom = atom<number>({
    key: 'worshipIndexChangeEventAtom',
    default: 0
})

export const setlistNoteAtom = atom<string>({
    key: 'worshipNoteAtom',
    default: ""
})

export const setlistUIVisibilityAtom = atom<boolean>({
    key: 'worshipUIVisibilityAtom',
    default: true
})
