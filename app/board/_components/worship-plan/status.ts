import {atom} from "recoil";
import {SongInfo} from "@/app/board/_components/worship-plan/new-button";


export const selectedSongInfoListAtom = atom<Array<SongInfo>>({
  key: "selectedSongInfoList",
  default: [],
})

