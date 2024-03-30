import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {TeamIcon} from "@/components/team-icon";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import Image from 'next/image'
import {RoleSelect} from "@/app/board/_components/nav-bar/role-select";
import {Input} from "@/components/ui/input";

const members = [
  {email: "banaba212@gmail.com", role: "Leader"},
  {email: "baaba212@gmail.com", role: "Member"},
  {email: "banaba2ddf12@gmail.com", role: "Member"},
]

export function ManageTeamButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Team</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] overflow-y-scroll scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-2xl">Manage Team</DialogTitle>
        </DialogHeader>
        <div className="flex-center gap-2">
          <TeamIcon name="GVC Friday"/>
          <p className="font-bold text-sm">GVC Friday</p>
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
            <Input placeholder="Email"/>
            <Button>Add People</Button>
          </div>
        </div>
        <div className="w-full flex-center">
        </div>
      </DialogContent>
    </Dialog>
  )
}
