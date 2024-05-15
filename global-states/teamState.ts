import {atom, atomFamily, selectorFamily} from "recoil";
import {Team} from "@/models/team";
import TeamService from "@/apis/TeamService";


export const currentTeamIdAtom = atom<string>({
  key: "currentTeamIdAtom",
  default: ""
})

export const teamAtom = atomFamily<Team, string>({
  key: "currentTeamIdAtom",
  default: selectorFamily({
    key: "teamAtom/default",
    get: (teamId) => async () => {
      try {
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
