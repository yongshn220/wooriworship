'use client'
import {RoutingPage} from "@/app/_components/routing-page";
import {LandingPage} from "@/app/_components/landing-page";
import {useEffect, useState} from "react";
import {auth} from "@/firebase";
import {getPathBoard, getPathPlan} from "@/components/util/helper/routes";
import {useRouter} from "next/navigation";
import {UserService} from "@/apis";
import useUserPreferences from "@/components/util/hook/use-local-preference";

enum AuthStatus {
  PROCESSING,
  VALID,
  NOT_VALID,
}

export default function RoutePage() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.PROCESSING)
  const [preferences, _] = useUserPreferences()
  const router = useRouter()

  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      console.log("ON AUTH STATE CHANGED")
      if (authUser) {
        UserService.getById(authUser.uid).then((user: any) => {
          if (!user) {
            console.log("Something went wrong.")
            return;
          }

          if (user.teams?.length === 0) {
            router.replace(getPathBoard())
            return
          }

          const teamId = user.teams.includes(preferences.board.selectedTeamId)? preferences.board.selectedTeamId : user.teams[0]
          router.replace(getPathPlan(teamId))
        })
      }
      else {
        setAuthStatus(AuthStatus.NOT_VALID)
      }
    });
  }, [preferences.board.selectedTeamId, router]);



  return (
    <div>
      {
        authStatus === AuthStatus.NOT_VALID
          ? <LandingPage/>
          : <RoutingPage/>
      }
    </div>
  )
}

