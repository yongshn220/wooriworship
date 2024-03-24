import {atom} from "recoil";
import {Routes} from "@/components/constants/enums";


export const currentPageAtom = atom({
  key: "currentPageAtom",
  default: Routes.BOARD
})
