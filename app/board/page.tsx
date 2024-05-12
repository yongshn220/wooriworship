"use client"

import {useEffect} from "react";
import {UserService} from "@/apis";
import {User} from "@/models/user";
import {useRouter} from "next/navigation";
import {getPathPlan} from "@/components/helper/routes";
import {auth} from "@/firebase";


export default function BoardPage() {
  const authUser = auth.currentUser

  const router = useRouter()

  useEffect(() => {
    if (authUser) {
      UserService.getById(authUser.uid).then((_user: any) => {
        const user = _user as User
        if (user.teams.length > 0) {
          router.push(getPathPlan(user.teams[0]))
        }
      })
    }
  }, [authUser, router])

  return (
    <div>
      Select your team to start
    </div>
  )
}
