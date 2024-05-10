"use client"

import {Session} from "next-auth";
import {AuthService} from "@/apis";
import {useSession} from "next-auth/react";
import {useEffect} from "react";
import {useSetRecoilState} from "recoil";
import {FirebaseSyncStatus, firebaseSyncStatusAtom} from "@/global-states/syncState";


async function syncFirebaseAuth(session: Session) {
  if (session && session.firebaseToken) {
    const result = await AuthService.loginWithCustomToken(session.firebaseToken)
    if (result) {
      console.log("fb sync succ")
      return true
    }
    else {
      console.log("fb sync fail")
      return false
    }
  }
  else {
    console.log("no session")
    await AuthService.logout();
    return false
  }
}

export function FirebaseAuthProvider({children}: {children: React.ReactNode}) {
  const {data: session} = useSession()
  const setFirebaseSyncStatus = useSetRecoilState(firebaseSyncStatusAtom)

  useEffect(() => {
    if (!session) return

    setFirebaseSyncStatus(FirebaseSyncStatus.PROCESSING)

    syncFirebaseAuth(session).then((isSuccess: boolean) => {
      if (isSuccess) {
        setFirebaseSyncStatus(FirebaseSyncStatus.SYNCED)
      }
      else {
        setFirebaseSyncStatus(FirebaseSyncStatus.NOT_SYNCED)
      }
    })
  }, [session, setFirebaseSyncStatus])

  return (
    <>
      {children}
    </>
  )
}
