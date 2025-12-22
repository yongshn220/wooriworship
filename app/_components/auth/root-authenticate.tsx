'use client'

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPathBoard } from "@/components/util/helper/routes";
import { auth } from "@/firebase";


export function RootAuthenticate({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter()

  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        router.replace(getPathBoard())
      }
    });
  }, [router]);

  return (
    <>
      {children}
    </>
  )
}
