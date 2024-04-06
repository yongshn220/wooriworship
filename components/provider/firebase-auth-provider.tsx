'use client'

import {useSession} from "next-auth/react";
import {useEffect} from "react";
import {Session} from "next-auth";
import {AuthService} from "@/apis";


async function syncFirebaseAuth(session: Session) {
  if (session && session.firebaseToken) {
    try {
      await AuthService.loginWithCustomToken(session.firebaseToken)
    }
    catch (e) {
      console.error(e)
    }
  }
  else {
    await AuthService.logout();
  }
}

export function FirebaseAuthProvider({children}: {children: React.ReactNode}) {
  const {data: session} = useSession()

  useEffect(() => {
    if (!session) return;

    syncFirebaseAuth(session)
  }, [session])

  return (
    <>
      {children}
    </>
  )
}
