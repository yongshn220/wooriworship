import { atom } from "recoil";
import { Page } from "../components/constants/enums";

export const currentPageAtom = atom({
  key: "currentPageAtom",
  default: Page.BOARD
})
