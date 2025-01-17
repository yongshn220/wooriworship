import {MainLogoRouter} from "@/components/elements/util/logo/main-logo";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {Login} from "@/app/_components/login";
import {Signup} from "@/app/_components/signup";
import {useState} from "react";

export enum LandingMode {
  LOGIN,
  SIGNUP
}

export function LandingPage() {
  const [mode, setMode] = useState(LandingMode.LOGIN)


  return (
    <div className="flex-center flex-col w-full">
      <div className="flex-between w-full max-w-7xl p-2 sm:p-5 left-0 top-0">
        <MainLogoRouter route="/"/>
        <Button variant="outline" onClick={() => setMode((mode === LandingMode.LOGIN)? LandingMode.SIGNUP : LandingMode.LOGIN)}>{(mode === LandingMode.LOGIN) ? "Sign Up" : "Sign In"}</Button>
      </div>
      <div className="w-full h-full flex flex-col items-center sm:p-5">
        <p className="hidden py-1 sm:flex mt-0 text-2xl sm:text-4xl md:text-5xl xl:text-6xl xl:mt-10 text-left font-bold text-white blue_gradient">
          Worship Team Manager
        </p>
        <p className="hidden sm:flex text-xl mt-4 text-gray-500">
          Create set list, Plan worship, and Share with team
        </p>
        <div className="w-full max-w-3xl flex-start flex-col sm:flex-row sm:mt-10 gap-20">
          <Image
            alt="compose music image"
            src="/illustration/composeMusic.svg"
            width={300}
            height={300}
            className="mt-8 hidden sm:flex"
          />
          {
            (mode === LandingMode.LOGIN) ? <Login setMode={setMode}/> : <Signup setMode={setMode}/>
          }
        </div>
      </div>
    </div>
  )
}
