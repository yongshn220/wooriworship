"use client"

import {useEffect} from "react";
import {UserService} from "@/apis";
import {User} from "@/models/user";
import {useRouter} from "next/navigation";
import {getPathHome} from "@/components/helper/routes";
import {auth} from "@/firebase";
import Image from "next/image";
import * as React from "react";
import {toast} from "@/components/ui/use-toast";
import useUserPreferences from "@/components/hook/use-local-preference";
import { TeamSelect } from "../../components/team/team-select";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { useRecoilState } from "recoil";


export default function BoardPage() {
  const authUser = auth.currentUser
  const [teamId, setTeamId] = useRecoilState(currentTeamIdAtom)
  const [preferences, _] = useUserPreferences()
  const router = useRouter()

  useEffect(() => {
    if (!authUser) {
      router.replace("/");
      return;
    }

    if (teamId) {
      router.push(getPathHome(teamId))
    }
    else {
      UserService.getById(authUser.uid).then((_user: any) => {
        if (!_user) {
          toast({title: "Something went wrong."})
          return;
        }
        const user = _user as User
        if (user?.teams?.length > 0) {
          const newTeamId = user.teams.includes(preferences.board.selectedTeamId)? preferences.board.selectedTeamId : user.teams[0]
          setTeamId(newTeamId)
          router.push(getPathHome(newTeamId))
        }
      })
    }
  }, [setTeamId, teamId, preferences.board.selectedTeamId, authUser, router])



  return (
    <div className="w-full h-full flex-center flex-col gap-4 bg-white">
      <Image
        alt="compose music image"
        src="/illustration/offRoadIllustration.svg"
        width={250}
        height={250}
      />
      <p className="text-2xl font-semibold">Welcome to Woori Worship!</p>
      <p className="text-gray-500">Select or add team to get started</p>
      <div className="w-[300px]">
        <TeamSelect createOption={true}/>
      </div>
    </div>
  )
}
