'use client'

import React, {useEffect} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useRecoilValue} from "recoil";
import {FirebaseSyncStatus, firebaseSyncStatusAtom} from "@/global-states/syncState";
import {getPathBoard} from "@/components/helper/routes";

const SessionType = {
  LOADING: "loading",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated"
}

export function RootAuthenticate({children}: Readonly<{ children: React.ReactNode }>) {
  const firebaseSyncStatus = useRecoilValue(firebaseSyncStatusAtom)
  const {status} = useSession()
  const router = useRouter()


  useEffect(() => {
    console.log(status, firebaseSyncStatus)
    if (status === SessionType.AUTHENTICATED && firebaseSyncStatus === FirebaseSyncStatus.SYNCED) {
      router.replace(getPathBoard())
    }
  }, [status, router, firebaseSyncStatus])

  return (
    <>
      {children}
    </>
  )
}
