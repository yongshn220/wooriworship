"use client"
import React from 'react';
import {RecoilRoot} from "recoil";

export function Provider({children}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RecoilRoot>
      {children}
    </RecoilRoot>
  )
}
