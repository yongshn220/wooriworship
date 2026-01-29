'use client'

import React, {useEffect, useState} from "react";
import {auth} from "@/firebase";
import {useRouter} from "next/navigation";
import { toast } from "@/components/ui/use-toast";

export function BoardAuthenticate({children}: Readonly<{ children: React.ReactNode }>) {
  const [access, setAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    let cancelled = false

    // authStateReady() waits for Firebase Auth to finish resolving the
    // persisted auth state from IndexedDB before we check auth status.
    // Without this, onAuthStateChanged can fire with null during the
    // initial persistence check, causing a redirect loop.
    auth.authStateReady().then(() => {
      if (cancelled) return

      unsubscribe = auth.onAuthStateChanged((authUser) => {
        if (cancelled) return
        if (authUser) {
          setAccess(true)
        } else {
          toast({title: "Please login to access this page."})
          router.replace("/")
        }
      })
    })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [router]);


  return (
    <div className="w-full h-full">
      {
        (access) && children
      }
    </div>
  )
}
