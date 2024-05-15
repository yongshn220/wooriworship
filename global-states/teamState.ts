import {atom, atomFamily, selector, selectorFamily} from "recoil";
import {Team} from "@/models/team";
import TeamService from "@/apis/TeamService";


export const currentTeamIdAtom = atom<string>({
  key: "currentTeamIdAtom",
  default: ""
})

export const teamAtom = atom<Team>({
  key: "teamAtom",
  default: selector({
    key: "teamAtom/default",
    get: async ({get}) => {
      try {
        const teamId = get(currentTeamIdAtom)
        if (!teamId) return null

        const team = await TeamService.getById(teamId) as Team
        if (!team) return null

        return team
      }
      catch (e) {
        console.log(e)
        return null
      }
    }
  })
})
