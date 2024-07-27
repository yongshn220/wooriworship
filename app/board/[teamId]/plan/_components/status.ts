import {atom} from "recoil";
import {SongInfo} from "@/app/board/[teamId]/plan/_components/new-worship-button";


export const selectedSongInfoListAtom = atom<Array<SongInfo>>({
  key: "selectedSongInfoListAtom",
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
