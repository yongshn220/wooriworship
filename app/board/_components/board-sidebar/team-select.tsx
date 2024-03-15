"use client"

import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {useRecoilValue} from "recoil";
import {userAtom} from "@/states/userState";

export function TeamSelect() {
  const user = useRecoilValue(userAtom)

  return (
    <Select>
      <SelectTrigger className="w-full mb-4">
        <SelectValue placeholder="Select a Team" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Team</SelectLabel>
          {
            user.teamList.map((team) => (
              <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>
            ))
          }
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
