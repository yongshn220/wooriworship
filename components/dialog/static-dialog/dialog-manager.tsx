import { useRecoilState } from "recoil";
import { InvitationInboxDialog } from "./invitation/invitation-inbox-dialog";
import {invitationInboxDialogOpenStateAtom} from "@/global-states/dialog-state";

export function DialogManager() {
  const [invitationInboxOpen, setInvitationInboxOpen] = useRecoilState(invitationInboxDialogOpenStateAtom)
  return (
    <>
      <InvitationInboxDialog isOpen={invitationInboxOpen} setIsOpen={setInvitationInboxOpen}/>
    </>
  )
}
