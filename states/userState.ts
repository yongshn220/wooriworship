import {atom, selector} from "recoil";
import {tempUser} from "@/components/temp-user";



export const userAtom = atom({
  key: "userAtom",
  default: selector({
    key: "userAtomDefault",
    get: async () => {
      return tempUser
    }
  })
})



export const nameAtom = atom({
  key: "nameAtom",
  default: "Yongjung"
})
