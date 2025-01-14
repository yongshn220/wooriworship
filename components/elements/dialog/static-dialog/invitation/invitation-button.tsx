import {MailIcon, Settings} from "lucide-react";
import {Button} from "@/components/ui/button";
import {auth} from "@/firebase";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {pendingReceivedInvitationsAtom} from "@/global-states/invitation-state";
import {invitationInboxDialogOpenStateAtom} from "@/global-states/dialog-state";


export function InvitationButton() {
  const authUser = auth.currentUser
  const invitations = useRecoilValue(pendingReceivedInvitationsAtom(authUser?.email))
  const setInvitationDialogState = useSetRecoilState(invitationInboxDialogOpenStateAtom)

  return (
    <Button variant="ghost" className="w-full justify-start text-lg py-6" onClick={() => setInvitationDialogState(true)}>
      <MailIcon className="mr-4 h-6 w-6"/>
      {
        invitations?.length > 0 &&
        <div className="rounded-full bg-red-500 w-5 h-5 text-white">{invitations?.length}</div>
      }
      Invitation Inbox
    </Button>
  )
}
