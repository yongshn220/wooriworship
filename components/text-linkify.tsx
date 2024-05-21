"use client"
import Linkify from 'react-linkify'
import React from "react";

export default function TextLinkify({children}: any) {
  return (
    <Linkify>
      {children}
    </Linkify>
  )
}
