import { useRecoilState } from "recoil";
import { InvitationInboxDrawer } from "./invitation/invitation-inbox-drawer";
import { invitationInboxDialogOpenStateAtom } from "@/global-states/dialog-state";

export function DialogManager() {
  const [invitationInboxOpen, setInvitationInboxOpen] = useRecoilState(invitationInboxDialogOpenStateAtom)
  return (
    <>
      <InvitationInboxDrawer isOpen={invitationInboxOpen} setIsOpen={setInvitationInboxOpen} />
    </>
  )
}
