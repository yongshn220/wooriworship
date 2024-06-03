import Image from "next/image";
import {RoleSelect} from "@/app/board/_components/nav-bar/role-select";
import {useRecoilValue} from "recoil";
import {userAtom} from "@/global-states/userState";
import { TeamService } from "@/apis";

interface Props {
  userId: string
}

export function InvitedMember({userId}: Props) {
  const user = useRecoilValue(userAtom(userId))

  async function handleRemoveMember(userId:string) {
    //todo: frontend -> bring the current team id
    const teamId = "";
    await TeamService.removeMember(userId, teamId);
  }

  return (
    <div className="w-full flex-start flex-col sm:flex-row sm:items-center gap-4 py-4">
      <div className="flex-1 flex-between gap-2">
        <div className="flex gap-2">
          <Image alt="mail icon" src="/icons/userIcon.svg" width={20} height={20}/>
          <p className="flex-1 text-sm">
            {user?.email}
          </p>
        </div>
      </div>
      <div className="w-full sm:w-[160px]">
        <RoleSelect/>
      </div>
      <p className="w-full sm:w-auto text-sm text-gray-500 text-right cursor-pointer" onClick={() => handleRemoveMember(user?.id)}>remove</p>
    </div>
  )
}
