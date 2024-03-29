'use client'
import {Button} from "@/components/ui/button";
import Image from 'next/image'
import Link from 'next/link'
import {Login} from "@/app/_components/login";
import {useState} from "react";
import {Signup} from "@/app/_components/signup";
import {MainLogo} from "@/components/logo/main-logo";

export enum Mode {
  LOGIN,
  SIGNUP
}
export default function Home() {
  const [mode, setMode] = useState(Mode.LOGIN)

  return (
    <div className="flex-center flex-col w-full">
      <div className="flex-between w-full max-w-7xl p-5 left-0 top-0">
        <MainLogo/>
        <Button variant="outline" onClick={() => setMode(Mode.SIGNUP)}>Sign Up</Button>
      </div>
      <div className="w-full h-full flex flex-col items-center p-5">
        <p className="mt-0 sm:mt-10 text-4xl md:text-6xl text-left font-bold text-white blue_gradient">
          Worship Team Assistant
        </p>
        <p className="text-xl mt-4 text-gray-500">
          Create set list, Plan worship, and Share with team
        </p>
        <div className="w-full max-w-3xl flex-start flex-col sm:flex-row mt-20 gap-20">
          <Image
            alt="compose music image"
            src="/composeMusic.svg"
            width={300}
            height={300}
            className="mt-8"
          />
          {
            (mode === Mode.LOGIN)? <Login setMode={setMode}/> : <Signup setMode={setMode}/>
          }
        </div>
      </div>
    </div>
  );
}

