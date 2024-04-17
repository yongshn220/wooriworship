import {atom} from "recoil";
import {SongInfo} from "@/app/board/_components/worship-plan/new-button";


export const selectedSongListAtom = atom<Array<SongInfo>>({
  key: "selectedSongList",
  default: [],
})
