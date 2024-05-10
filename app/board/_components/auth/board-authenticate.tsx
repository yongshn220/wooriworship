'use client'

import React, {useEffect} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {Routes} from "@/components/constants/enums";
import {useRecoilValue} from "recoil";
import {FirebaseSyncStatus, firebaseSyncStatusAtom} from "@/global-states/syncState";

const SessionType = {
  LOADING: "loading",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated"
}

export function BoardAuthenticate({children}: Readonly<{ children: React.ReactNode }>) {
  const firebaseSyncStatus = useRecoilValue(firebaseSyncStatusAtom)
  const {status} = useSession()
  const router = useRouter()

  useEffect(() => {
    console.log("check", status, firebaseSyncStatus)
    if (status === SessionType.UNAUTHENTICATED) {
      router.replace(Routes.HOME)
    }
    if (status === SessionType.AUTHENTICATED && firebaseSyncStatus !== FirebaseSyncStatus.SYNCED) {
      console.log("Try to sync firebase...")
    }
  }, [status, router, firebaseSyncStatus])

  return (
    <div>
      {
        (status === SessionType.AUTHENTICATED && firebaseSyncStatus === FirebaseSyncStatus.SYNCED) && children
      }
    </div>
  )
}
