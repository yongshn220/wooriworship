"use client"
import React from 'react';
import {RecoilRoot} from "recoil";
import {SessionProvider} from "next-auth/react";

export function Provider({children}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <RecoilRoot>
        {children}
      </RecoilRoot>
    </SessionProvider>
  )
}
