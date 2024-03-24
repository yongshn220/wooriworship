import {atom, selector} from "recoil";


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
