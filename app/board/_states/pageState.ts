import {atom} from "recoil";
import {Page, Routes} from "@/components/constants/enums";


export const currentPageAtom = atom({
  key: "currentPageAtom",
  default: Page.BOARD
})

export const songSearchInputAtom = atom({
  key: "songSearchInputAtom",
  default: ""
})


export const searchSelectedTagsAtom = atom<Array<string>>({
  key: "searchSelectedTagsAtom",
  default: []
})
