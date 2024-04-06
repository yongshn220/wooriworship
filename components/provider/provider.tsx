"use client"
import React from 'react';
import {RecoilRoot} from "recoil";
import {SessionProvider} from "next-auth/react";
import {FirebaseAuthProvider} from "@/components/provider/firebase-auth-provider";

export function Provider({children}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <FirebaseAuthProvider>
        <RecoilRoot>
          {children}
        </RecoilRoot>
      </FirebaseAuthProvider>
    </SessionProvider>
  )
}
