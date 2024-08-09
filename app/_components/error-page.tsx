"use client"

import {MainLogo} from "@/components/logo/main-logo";
import Image from "next/image";
import * as React from "react";
import {Button} from "@/components/ui/button";
import Link from "next/link";

export function ErrorPage() {
  return (
    <div className="flex-center flex-col w-full h-full gap-4">
      <div className="absolute bottom-10">
        <MainLogo/>
      </div>
      <Image
        alt="compose music image"
        src="/illustration/warningPerson.svg"
        width={300}
        height={300}
      />
      <p className="text-3xl font-semibold">Something went wrong</p>
      <p className="text-gray-500 max-w-lg">We&apos;re sorry, but the page you were trying to access is not available right now. Please try again later or contact us if the issue persists.</p>
      <Link href={"/"}>
        <Button>Go back home</Button>
      </Link>
    </div>
  )
}
