import {MailIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {auth} from "@/firebase";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {pendingReceivedInvitationsAtom} from "@/global-states/invitation-state";
import {invitationDialogStateAtom} from "@/global-states/dialog-state";


export function InvitationButton() {
  const authUser = auth.currentUser
  const invitations = useRecoilValue(pendingReceivedInvitationsAtom(authUser?.email))
  const setInvitationDialogState = useSetRecoilState(invitationDialogStateAtom)

  return (
    <Button variant="ghost" className="w-full flex-start gap-2" onClick={() => setInvitationDialogState(true)}>
      <MailIcon className="w-[20px] h-[20px]"/>
      <p>Invitations</p>
      {
        invitations?.length > 0 &&
        <div className="rounded-full bg-red-500 w-5 h-5 text-white">{invitations?.length}</div>
      }
    </Button>
  )
}
