import {atom, selector} from "recoil";
import {tempUser} from "@/components/temp-user";
import {User} from "@/models/user";


export const userAtom = atom({
  key: "userAtom",
  default: tempUser
})

export const currentUserAtom = atom<User | null>({
  key: "currentUserAtom",
  default: null
})

export const nameAtom = atom({
  key: "nameAtom",
  default: "Yongjung"
})
