import { useRecoilState } from "recoil";
import { InvitationInboxDialog } from "./invitation/invitation-inbox-dialog";
import {invitationInboxDialogOpenStateAtom, settingDialogOpenStateAtom} from "@/global-states/dialog-state";
import {SettingDialog} from "@/components/dialog-manager/setting/setting-dialog";

export function DialogManager() {
  const [invitationInboxOpen, setInvitationInboxOpen] = useRecoilState(invitationInboxDialogOpenStateAtom)
  const [settingOpen, setSettingOpen] = useRecoilState(settingDialogOpenStateAtom)
  return (
    <>
      <InvitationInboxDialog isOpen={invitationInboxOpen} setIsOpen={setInvitationInboxOpen}/>
      <SettingDialog isOpen={settingOpen} setIsOpen={setSettingOpen}/>
    </>
  )
}
