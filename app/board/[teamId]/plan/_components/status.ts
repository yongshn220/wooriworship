import {atom} from "recoil";
import {WorshipSongWrapper} from "@/components/constants/types";


export const selectedWorshipSongWrapperListAtom = atom<Array<WorshipSongWrapper>>({
  key: "selectedWorshipSongWrapperListAtom",
  default: [],
})

export const worshipBeginningSongWrapperAtom = atom<{id: string, key: string}>({
  key: "worshipBeginningSongWrapperAtom",
  default: {
    id: "",
    key: "",
  }
})

export const worshipEndingSongWrapperAtom = atom<{id: string, key: string}>({
  key: "worshipEndingSongWrapperAtom",
  default: {
    id: "",
    key: "",
  }
})
