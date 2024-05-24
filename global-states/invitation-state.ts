import {atom, atomFamily, selectorFamily} from "recoil";
import {InvitationService} from "@/apis";
import {Invitation} from "@/models/invitation";




export const sentInvitationsAtom = atomFamily<Array<Invitation>, { userId: string, teamId: string }>({
  key: "sentInvitationsAtom",
  default: selectorFamily({
    key: "sentInvitationsAtom/default",
    get: ({userId, teamId}) => async ({get}) => {
      try {
        get(sentInvitationsUpdaterAtom)
        if (!userId || !teamId) return []

        const invitations = await InvitationService.getTeamSentInvitations(userId, teamId)
        if (!invitations) return []

        return invitations
      }
      catch (e) {
        console.log(e)
        return []
      }
    }
  })
})

export const sentInvitationsUpdaterAtom = atom({
  key: "sentInvitationsUpdaterAtom",
  default: 0
})


export const pendingReceivedInvitationsAtom = atomFamily<Array<Invitation>, string>({
  key: "pendingReceivedInvitationsAtom",
  default: selectorFamily({
    key: "pendingReceivedInvitationsAtom/default",
    get: (receiverEmail: string) => async () => {
      if (!receiverEmail) return []

      try {
        const invitations = await InvitationService.getPendingReceivedInvitations(receiverEmail)
        if (!invitations) return []

        return invitations
      }
      catch (e) {
        console.log(e)
        return []
      }
    }
  })
})





