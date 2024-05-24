"use client"

import {useEffect, useState} from "react";
import {UserService} from "@/apis";
import {User} from "@/models/user";
import {useRouter} from "next/navigation";
import {getPathPlan} from "@/components/helper/routes";
import {auth} from "@/firebase";
import Image from "next/image";
import * as React from "react";
import {Hint} from "@/components/hint";
import {Plus} from "lucide-react";
import {CreateNewTeamDialog} from "@/app/board/_components/create-new-team-dialog";
import {Button} from "@/components/ui/button";


export default function BoardPage() {
  const authUser = auth.currentUser
  const [isTeamEmpty, setIsTeamEmpty] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (authUser) {
      UserService.getById(authUser.uid).then((_user: any) => {
        const user = _user as User
        if (user.teams.length > 0) {
          router.push(getPathPlan(user.teams[0]))
        }
        else {
          setIsTeamEmpty(true)
        }
      })
    }
  }, [authUser, router])

  return (
    <div className="w-full h-full flex-center">
      {
        isTeamEmpty ?
        <div className="w-full h-full flex-center flex-col gap-4">
          <Image
            alt="compose music image"
            src="/illustration/offRoadIllustration.svg"
            width={300}
            height={300}
          />
          <p className="text-3xl font-semibold">Welcome to Wooriworship!</p>
          <p className="text-gray-500">Click &ldquo;Add Team&rdquo; button to get started</p>
          <CreateNewTeamDialog>
            <Button>+ Add Team</Button>
          </CreateNewTeamDialog>
        </div>
          :
        <div>
          Select your team to start
        </div>
      }
    </div>
  )
}
