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

export function RootAuthenticate({children}: Readonly<{ children: React.ReactNode }>) {
  const {status} = useSession()
  const router = useRouter()


  useEffect(() => {
    if (status === SessionType.AUTHENTICATED) {
      console.log("root authenticate")
      router.replace(Routes.PLAN)
    }
  }, [status, router])

  return (
    <>
      {children}
    </>
  )
}
