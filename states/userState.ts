import {atom, selector} from "recoil";

export const teamListAtom = atom({
  key: "teamListAtom",
  default: selector({
    key: "teamListAtomDefault",
    get: async () => {
      return [{id: "1", name: "GVC Friday"}, {id: "2", name: "YJ Worship"}]
    }
  })
})



export const nameAtom = atom({
  key: "nameAtom",
  default: "Yongjung"
})
