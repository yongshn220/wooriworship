'use client'

import React, {useEffect, useState} from "react";
import {auth} from "@/firebase";
import {useRouter} from "next/navigation";

export function BoardAuthenticate({children}: Readonly<{ children: React.ReactNode }>) {
  const [access, setAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        console.log("LOGIN SUCCESS", authUser.uid)
        setAccess(true)
      }
      else {
        router.replace("/")
      }
    });
  }, [router]);


  return (
    <div className="w-full h-full">
      {
        (access) && children
      }
    </div>
  )
}
