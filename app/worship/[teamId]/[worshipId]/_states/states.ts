import {atom} from "recoil";
import {Worship} from "@/models/worship";
import {Song} from "@/models/song";


export const worshipMenuAtom = atom({
  key: "worshipMenuAtom",
  default: {
    note: true,
    index: true,
  }
})


export const worshipIndexAtom = atom({
  key: "worshipIndexAtom",
  default: {
    total: 0,
    current: 0,
  }
})

export const currentWorshipAtom = atom<Worship>({
  key: "currentWorshipAtom",
  default: null
})

export const currentSongListAtom = atom<Array<Song>>({
  key: "currentSongListAtom",
  default: []
})
