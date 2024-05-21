import {atom} from "recoil";
import {Worship} from "@/models/worship";
import {Song} from "@/models/song";


export const worshipMenuAtom = atom({
  key: "worshipMenuAtom",
  default: {
    showSongNote: true,
    showSongNumber: true,
  }
})


export const worshipIndexAtom = atom({
  key: "worshipIndexAtom",
  default: {
    total: 0,
    current: 0,
  }
})
