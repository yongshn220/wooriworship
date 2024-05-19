import {atom} from "recoil";
import {SongInfo} from "@/app/board/[teamId]/plan/_components/new-worship-button";


export const selectedSongInfoListAtom = atom<Array<SongInfo>>({
  key: "selectedSongInfoList",
  default: [],
})

