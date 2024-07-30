import {atom} from "recoil";
import {WorshipSongWrapper} from "@/components/constants/types";


export const selectedWorshipSongWrapperListAtom = atom<Array<WorshipSongWrapper>>({
  key: "selectedWorshipSongWrapperListAtom",
  default: [],
})

export const worshipBeginningSongIdAtom = atom<string>({
  key: "worshipBeginningSongIdAtom",
  default: null
})

export const worshipEndingSongIdAtom = atom<string>({
  key: "worshipEndingSongIdAtom",
  default: null
})
