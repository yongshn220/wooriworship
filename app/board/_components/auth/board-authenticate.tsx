'use client'

import React, {useEffect, useState} from "react";
import {auth} from "@/firebase";
import {useRouter} from "next/navigation";
import { toast } from "@/components/ui/use-toast";

export function BoardAuthenticate({children}: Readonly<{ children: React.ReactNode }>) {
  const [access, setAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setAccess(true)
      }
      else {
        toast({title: "Please login to access this page."})
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
