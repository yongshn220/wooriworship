import {atom} from "recoil";
import {Team} from "@/models/team";

export const currentTeamAtom = atom<Team | null>({
  key: "currentTeamAtom",
  default: null
})
