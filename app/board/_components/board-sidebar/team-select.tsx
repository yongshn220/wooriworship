"use client"

import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {useSession} from "next-auth/react";

export async function TeamSelect() {
  const {data: session} = useSession()
  if (!session) return <></>

  return (
    <Select>
      <SelectTrigger className="w-full mb-4">
        <SelectValue placeholder="Select a Team" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Team</SelectLabel>
          {
            session.user.teams.map((teamId, i) => (
              <SelectItem key={i} value={teamId}/>
            ))
          }
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
