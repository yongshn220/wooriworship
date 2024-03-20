import {atom, selector} from "recoil";





export const worshipMenuAtom = atom({
  key: "worshipMenuAtom",
  default: {
    note: true,
    index: true,
  }
})
