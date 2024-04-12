"use client"

import {useSession} from "next-auth/react";
import {useEffect} from "react";
import {UserService} from "@/apis";
import {User} from "@/models/user";
import {useRouter} from "next/navigation";
import {getPathPlan} from "@/components/helper-function/routes";


export default function BoardPage() {
  const {data: session} = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) return

    UserService.getById(session?.user.id).then((_user: any) => {
      const user = _user as User
      if (user.teams.length > 0) {
        router.push(getPathPlan(user.teams[0]))
      }
    })
  }, [router, session])

  return (
    <div>
      Select your team to start
    </div>
  )
}
