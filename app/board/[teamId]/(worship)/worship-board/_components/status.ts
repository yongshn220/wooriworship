import {atom} from "recoil";
import {WorshipSongHeader} from "@/models/worship";

export const selectedWorshipSongHeaderListAtom = atom<Array<WorshipSongHeader>>({
  key: "selectedWorshipSongHeaderListAtom",
  default: [],
})


export const worshipBeginningSongHeaderAtom = atom<WorshipSongHeader>({
  key: "worshipBeginningSongHeaderAtom",
  default: {
    id: "",
    note: "",
    selected_music_sheet_ids: []
  }
})

export const worshipEndingSongHeaderAtom = atom<WorshipSongHeader>({
  key: "worshipEndingSongHeaderAtom",
  default: {
    id: "",
    note: "",
    selected_music_sheet_ids: []
  }
})
