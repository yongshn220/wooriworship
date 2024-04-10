import {atom} from "recoil";


export const firebaseSyncAtom = atom<boolean>({
  key: "firebaseSyncAtom",
  default: false
})
