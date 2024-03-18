'use client'
import {CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import Link from "next/link";
import {Mode} from "@/app/page";


export function Login({setMode}: any) {
  const [login, setLogin] = useState({
    email: "",
    password: "",
  })

  async function handleLogin() {
    console.log(login.email)
    console.log(login.password)
  }

  return (
    <div className="w-full flex-center">
      <div className="w-full sm:max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold">Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="loginEmail" placeholder="m@example.com" required type="email"
                   onChange={(e) => setLogin((prev) => ({...prev, email: e.target.value}))}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="loginPassword" required type="password"
                   onChange={(e) => setLogin((prev) => ({...prev, password: e.target.value}))}/>
          </div>
          <Button className="w-full" onClick={handleLogin}>Login</Button>
          <div className="flex flex-col mt-4 text-center text-sm gap-2">
            <Link className="underline" href="#">
              Forgot your password?
            </Link>
            <div className="underline cursor-pointer" onClick={() => {setMode(Mode.SIGNUP)}} >
              Create account
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  )
}
