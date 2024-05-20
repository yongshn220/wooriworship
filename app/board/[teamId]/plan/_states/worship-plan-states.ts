import {atom, selector} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {WorshipService} from "@/apis";


export const currentTeamWorshipIdsAtom = atom<Array<string>>({
  key: "currentTeamWorshipIdsAtom",
  default: selector({
    key: "currentTeamWorshipIdsAtom/default",
    get: async ({get}) => {
      try {
        console.log("currentTeamWorshipIdsAtom")
        const teamId = get(currentTeamIdAtom)
        if (!teamId) return []

        const worshipList = await WorshipService.getTeamWorship(teamId)
        if (!worshipList) return []

        return worshipList.map((worship => worship.id))
      }
      catch (e) {
        console.log(e)
        return []
      }
    }
  })
})
