import {atom, atomFamily, selectorFamily} from "recoil";
import {Team} from "@/models/team";
import TeamService from "@/apis/TeamService";


export const currentTeamIdAtom = atom<string>({
  key: "currentTeamIdAtom",
  default: null
})

export const resetCurrentTeamIdState = (set: any) => {
  set(currentTeamIdAtom, null)
}

export const teamAtom = atomFamily<Team, string>({
  key: "teamAtom",
  default: selectorFamily({
    key: "teamAtom/default",
    get: (teamId) => async ({get}) => {
      get(teamUpdaterAtom)

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

export const teamUpdaterAtom = atom({
  key: "teamUpdaterAtom",
  default: 0
})
