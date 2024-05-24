"use client"

import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {TeamIcon} from "@/components/team-icon";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import Image from 'next/image'
import {RoleSelect} from "@/app/board/_components/nav-bar/role-select";
import {Input} from "@/components/ui/input";
import {useCallback, useState} from "react";
import {DeleteConfirmationDialog} from "@/components/dialog/delete-confirmation-dialog";
import {currentTeamIdAtom, teamAtom} from "@/global-states/teamState";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {userUpdaterAtom} from "@/global-states/userState";
import {useRouter} from "next/navigation";
import {getPathBoard} from "@/components/helper/routes";
import {SettingsIcon} from "lucide-react";
import { InvitationService } from "@/apis";

const members = [
  {email: "banaba212@gmail.com", role: "Leader"},
  {email: "baaba212@gmail.com", role: "Member"},
  {email: "banaba2ddf12@gmail.com", role: "Member"},
]

export function ManageTeamButton() {
  const setUserUpdater = useSetRecoilState(userUpdaterAtom)
  const currentTeamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtom(currentTeamId))
  const [email, setEmail] = useState("")
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false)
  const router = useRouter()

  async function handleAddPeople() {
    const senderId = "nvu1LW6DElOGWDjLs0KVCZQ6Rll2"
      const senderEmail = "hvandhl88@gmail.com"
      const teamName = "TestTeam123"
      const receiverEmail = "yongshn220@gmail.com"
      await InvitationService.createInvitation(senderId, senderEmail, currentTeamId, teamName, receiverEmail);
      console.log("email sent!!!");
  }

  async function handleDeleteTeam() {
    setIsOpenDeleteDialog(true)
    // Todo: firebase
  }

  function onDeleteTeamCompleteCallback() {
    setIsOpenDeleteDialog(false)
    // setUserUpdater(prev => prev + 1)
    // router.replace(getPathBoard())
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!currentTeamId} variant="outline" className="w-full">
          <SettingsIcon className="h-4 w-4 mr-2"/>
          <p>Manage Team</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] overflow-y-scroll scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-2xl">Manage Team</DialogTitle>
        </DialogHeader>
        <div className="flex-center gap-2">
          <TeamIcon name={team?.name}/>
          <p className="font-bold text-sm">{team?.name}</p>
        </div>
        <div className="w-full flex-start flex-col items-center gap-1.5">
          <Label htmlFor="name" className="text-xl sm:text-base">
            Members
          </Label>
          <div className="w-full divide-y divide-gray-300">
            {
              members.map((member) => (
                <div key={member.email} className="w-full flex-start flex-col sm:flex-row sm:items-center gap-4 py-4">
                  <div className="flex-1 flex-between gap-2">
                    <div className="flex gap-2">
                      <Image alt="mail icon" src="/icons/userIcon.svg" width={20} height={20}/>
                      <p className="flex-1">
                        {member.email}
                      </p>
                    </div>
                    <p className="text-sm text-right mr-12 text-gray-500">pending</p>
                  </div>
                  <div className="w-full sm:w-[160px]">
                    <RoleSelect/>
                  </div>
                  <p className="w-full sm:w-auto text-sm text-gray-500 text-right cursor-pointer">remove</p>
                </div>
              ))
            }
          </div>
          <div className="w-full flex gap-4 mt-4">
            <Image alt="mail icon" src="/icons/mailIcon.svg" width={25} height={25}/>
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            <Button onClick={handleAddPeople}>Add People</Button>
          </div>
        </div>
        <DialogFooter className="mt-10">
          <DeleteConfirmationDialog
            isOpen={isOpenDeleteDialog}
            setOpen={setIsOpenDeleteDialog}
            title="Delete Team"
            description={`Do you really want to delete [${team?.name}]? This action cannot be undone.`}
            onDeleteHandler={handleDeleteTeam}
            callback={onDeleteTeamCompleteCallback}
          />
          <Button variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-500" onClick={handleDeleteTeam}>Delete Team</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
