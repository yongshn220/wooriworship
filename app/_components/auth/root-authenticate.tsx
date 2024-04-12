'use client'

import React, {useEffect} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {Routes} from "@/components/constants/enums";
import {useRecoilValue} from "recoil";
import {firebaseSyncAtom} from "@/global-states/syncState";
import {getPathBoard, getPathPlan} from "@/components/helper-function/routes";
import {UserService} from "@/apis";

const SessionType = {
  LOADING: "loading",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated"
}

export function RootAuthenticate({children}: Readonly<{ children: React.ReactNode }>) {
  const isFirebaseSynced = useRecoilValue(firebaseSyncAtom)
  const {status} = useSession()
  const router = useRouter()


  useEffect(() => {
    console.log(status, isFirebaseSynced)
    if (status === SessionType.AUTHENTICATED && isFirebaseSynced) {

      router.replace(getPathBoard())
    }
  }, [status, router, isFirebaseSynced])

  return (
    <>
      {children}
    </>
  )
}
