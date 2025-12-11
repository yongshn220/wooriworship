import { atom } from "recoil";
import { SongBoardSortOption } from "@/components/constants/enums";


export const songSearchInputAtom = atom({
  key: "songSearchInputAtom",
  default: ""
})

export const searchSelectedTagsAtom = atom<Array<string>>({
  key: "searchSelectedTagsAtom",
  default: []
})

export const searchSelectedKeysAtom = atom<Array<string>>({
  key: "searchSelectedKeysAtom",
  default: []
})

export const songBoardSelectedSortOptionAtom = atom<SongBoardSortOption>({
  key: "songBoardSelectedSortOptionAtom",
  default: SongBoardSortOption.TITLE_ASCENDING,
})

export const planSearchInputAtom = atom({
  key: "planSearchInputAtom",
  default: ""
})