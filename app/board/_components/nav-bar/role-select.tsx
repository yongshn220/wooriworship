"use client"

import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {useRecoilValue} from "recoil";
import {userAtom} from "@/global-states/userState";


const roles = ["Leader", "Member"]

export function RoleSelect() {
  const user = useRecoilValue(userAtom)

  return (
    <Select>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a Role" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Team</SelectLabel>
          {
            roles.map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))
          }
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
