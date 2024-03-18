'use client'

import {CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {Mode} from "@/app/page";


export function Signup({setMode}: any) {
    const [signup, setSignup] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })


  function handleSignup() {
    console.log(signup.email)
    console.log(signup.password)
    console.log(signup.confirmPassword)
  }

  return (
    <div className="w-full flex-center">
      <div className="w-full sm:max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="signupEmail" placeholder="m@example.com" required type="email" onChange={(e) => setSignup((prev) => ({...prev, email: e.target.value}))}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="signupPassword" required type="password" onChange={(e) => setSignup((prev) => ({...prev, password: e.target.value}))}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Confirm Password</Label>
              <Input id="signupconfirmPassword" required type="password" onChange={(e) => setSignup((prev) => ({...prev, confirmPassword: e.target.value}))}/>
            </div>
            <Button className="w-full" onClick={handleSignup}>Sign Up</Button>
            <div className="flex-center mt-4 text-center text-sm gap-2">
              <p>Already have an account?</p>
              <div className="underline cursor-pointer" onClick={() => {setMode(Mode.LOGIN)}}>
                Sign In
              </div>
            </div>
        </CardContent>
      </div>
    </div>
  )
}
