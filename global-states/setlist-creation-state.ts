import { atom } from "recoil";
import { SetlistSongHeader } from "@/models/setlist";

export const selectedSetlistSongHeaderListAtom = atom<Array<SetlistSongHeader>>({
    key: "selectedSetlistSongHeaderListAtom",
    default: [],
})


export const setlistBeginningSongHeaderAtom = atom<SetlistSongHeader>({
    key: "setlistBeginningSongHeaderAtom",
    default: {
        id: "",
        note: "",
        selected_music_sheet_ids: []
    }
})

export const setlistEndingSongHeaderAtom = atom<SetlistSongHeader>({
    key: "setlistEndingSongHeaderAtom",
    default: {
        id: "",
        note: "",
        selected_music_sheet_ids: []
    }
})
