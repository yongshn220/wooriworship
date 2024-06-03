import Image from "next/image";
import {RoleSelect} from "@/app/board/_components/nav-bar/role-select";
import {Invitation} from "@/models/invitation";
import { InvitationService } from "@/apis";

interface Props {
  invitation: Invitation
}

export function PendingMember({invitation}: Props) {

  async function handleRemoveInvitation() {
    try {
      await InvitationService.delete(invitation.id);
      console.log("deleted invitation");
    } catch (err) {
      console.log(err);
    }
    //todo: frontend -> update after deletion
  }

  return (
    <div className="w-full flex-start flex-col sm:flex-row sm:items-center gap-4 py-4">
      <div className="flex-1 flex-between gap-2">
        <div className="flex gap-2">
          <Image alt="mail icon" src="/icons/userIcon.svg" width={20} height={20}/>
          <p className="flex-1 text-sm">
            {invitation?.receiver_email}
          </p>
        </div>
        <p className="text-sm text-right mr-12 text-gray-500">pending</p>
      </div>
      <div className="w-full sm:w-[160px]">
        <RoleSelect/>
      </div>
      <p className="w-full sm:w-auto text-sm text-gray-500 text-right cursor-pointer" onClick={() => handleRemoveInvitation()}>remove</p>
    </div>
  )
}
