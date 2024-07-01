"use client"

import {useEffect, useState} from "react";
import {UserService} from "@/apis";
import {User} from "@/models/user";
import {useRouter} from "next/navigation";
import {getPathPlan} from "@/components/helper/routes";
import {auth} from "@/firebase";
import Image from "next/image";
import * as React from "react";
import {CreateNewTeamDialog} from "@/app/board/_components/create-new-team-dialog";
import {Button} from "@/components/ui/button";
import {toast} from "@/components/ui/use-toast";
import useUserPreferences from "@/components/hook/use-local-preference";
import {MainLogo} from "@/components/logo/main-logo";
import {isMobile} from "@/components/helper/helper-functions";


export default function BoardPage() {
  const authUser = auth.currentUser
  const [preferences, setPreferences] = useUserPreferences()
  const [isTeamEmpty, setIsTeamEmpty] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (authUser) {
      UserService.getById(authUser.uid).then((_user: any) => {
        if (!_user) {
          toast({title: "Something went wrong."})
          return;
        }
        const user = _user as User
        if (user.teams.length > 0) {
          const teamId = user.teams.includes(preferences.board.selectedTeamId)? preferences.board.selectedTeamId : user.teams[0]
          router.push(getPathPlan(teamId))
        }
        else {
          setIsTeamEmpty(true)
        }
      })
    }
  }, [preferences.board.selectedTeamId, authUser, router])

  return (
    <div className="w-full h-full flex-center">
      {
        isTeamEmpty ?
        <div className="w-full h-full flex-center flex-col gap-4">
          {
            isMobile() ?
            <Image
              alt="compose music image"
              src="/illustration/offRoadIllustration.svg"
              width={250}
              height={250}
            />
              :
            <Image
              alt="compose music image"
              src="/illustration/offRoadIllustration.svg"
              width={300}
              height={300}
            />
          }
          {
            isMobile() ?
            <p className="text-3xl font-semibold">Welcome!</p>
              :
            <p className="text-3xl font-semibold">Welcome to Woori Worship!</p>
          }
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
