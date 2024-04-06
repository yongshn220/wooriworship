"use client"

import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {UserService} from "@/apis";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/option";
import {User} from "@/models/user";
import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";

export function TeamSelect() {
  const {data: session} = useSession()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!session) return

    UserService.getById(session.user.id).then((_user) => {
      setUser(_user as User)
    })
  }, [session])

  return (
    <Select>
      <SelectTrigger className="w-full mb-4">
        <SelectValue placeholder="Select a Team" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Team</SelectLabel>
          {
            user?.teams.map((teamId, i) => (
              <SelectItem key={i} value={teamId}/>
            ))
          }
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
