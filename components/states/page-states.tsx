import { atom } from "recoil";
import { Page } from "../constants/enums";

export const currentPageAtom = atom({
  key: "currentPageAtom",
  default: Page.BOARD
})