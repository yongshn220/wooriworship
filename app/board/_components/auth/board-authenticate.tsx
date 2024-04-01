'use client'

import React, {useEffect} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {Routes} from "@/components/constants/enums";

const SessionType = {
  LOADING: "loading",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated"
}

export function BoardAuthenticate({children}: Readonly<{ children: React.ReactNode }>) {
  const {status} = useSession()
  const router = useRouter()

  useEffect(() => {
    console.log("check", status)
    if (status === SessionType.UNAUTHENTICATED) {
      console.log("unauth")
      router.replace(Routes.HOME)
    }
  }, [status, router])

  return (
    <div>
      {
        (status === SessionType.AUTHENTICATED) && children
      }
    </div>
  )
}
