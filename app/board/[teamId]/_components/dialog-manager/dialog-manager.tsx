import { useRecoilState } from "recoil";
import { InvitationInboxDialog } from "./invitation/invitation-inbox-dialog";
import { invitationDialogStateAtom } from "@/global-states/dialog-state";

export function DialogManager() {
  const [invitationDialogState, setInvitationDialogState] = useRecoilState(invitationDialogStateAtom)
  return (
    <>
      <InvitationInboxDialog isOpen={invitationDialogState} setIsOpen={setInvitationDialogState}/>
    </>
  )
}