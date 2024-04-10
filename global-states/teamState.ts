import {atom, atomFamily, selectorFamily} from "recoil";
import {Team} from "@/models/team";
import TeamService from "@/apis/TeamService";


export const currentTeamIdAtom = atom<string>({
  key: "currentTeamIdAtom",
  default: ""
})

export const teamAtomById = atomFamily<Team | null, string>({
  key: "currentTeamIdAtom",
  default: selectorFamily({
    key: "teamAtomById/Default",
    get: (id) => async () => {
      if (id) {
        return await TeamService.getById(id) as Team
      }
      else {
        return null
      }
    }
  })
})
