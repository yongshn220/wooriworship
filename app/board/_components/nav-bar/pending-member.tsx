import Image from "next/image";
import {RoleSelect} from "@/app/board/_components/nav-bar/role-select";
import {Invitation} from "@/models/invitation";
import { InvitationService } from "@/apis";
import {InvitationStatus} from "@/components/constants/enums";
import {toast} from "@/components/ui/use-toast";
import {sentInvitationsUpdaterAtom} from "@/global-states/invitation-state";
import {useSetRecoilState} from "recoil";

interface Props {
  invitation: Invitation
}

export function PendingMember({invitation}: Props) {
  const sentInvitationsUpdater = useSetRecoilState(sentInvitationsUpdaterAtom)

  async function handleRemoveInvitation() {
    if (await InvitationService.delete(invitation.id) === false) {
      toast({title: "Something went wrong. Please try again later."})
      return;
    }

    /* on success */
    sentInvitationsUpdater(prev => prev + 1)
    toast({title: "You have successfully remove the invitation"})
  }

  return (
    <div className="w-full flex-start flex-col sm:flex-row sm:items-center gap-4 py-4">
      <div className="flex-1 flex-between gap-2">
        <div className="flex gap-2">
          <Image alt="mail icon" src="/icons/userIcon.svg" width={20} height={20}/>
          <p className="flex-1 text-sm">
            {invitation?.receiver_email}
          </p>
          <p className="text-sm text-right text-gray-500">
            ({InvitationStatus[invitation.invitation_status as InvitationStatus]})
          </p>
        </div>
      </div>
      {
        invitation.invitation_status === InvitationStatus.Pending &&
        <div className="w-full sm:w-[160px]">
          <RoleSelect/>
        </div>
      }
      <p className="w-full sm:w-auto text-sm text-red-500 text-right cursor-pointer" onClick={handleRemoveInvitation}>remove</p>
    </div>
  )
}
