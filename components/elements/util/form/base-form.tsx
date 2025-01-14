import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import React, {ReactNode} from "react";

interface Props {
  children: ReactNode
  title: string
  description: string
}

export function BaseForm({children, title, description}: Props) {
  return (
    <Card className="w-full h-full justify-center border-0 shadow-none p-0 m-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        {children}
      </CardContent>
    </Card>
  )
}
