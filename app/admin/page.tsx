"use client"

import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {useState} from "react";

export default function AdminPage() {
  const [login, setLogin] = useState({
    email: "",
    password: "",
  })

  const [signup, setSignup] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })


  /*-----------
   BACKEND TEST
   -----------*/
  async function handleLogin() {
    console.log(login.email)
    console.log(login.password)
  }

  function handleSignup() {
    console.log(signup.email)
    console.log(signup.password)
    console.log(signup.confirmPassword)
  }


  return (
    <section className="flex flex-col justify-center items-center gap-4">
      <div className="text-2xl font-bold">
        Backend Test Area
      </div>
      <div className="flex gap-4">

        <div>
          <Card className="px-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold">Login</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="loginEmail" placeholder="m@example.com" required type="email" onChange={(e) => setLogin((prev) => ({...prev, email: e.target.value}))}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="loginPassword" required type="password" onChange={(e) => setLogin((prev) => ({...prev, password: e.target.value}))}/>
              </div>
              <Button className="w-full" onClick={handleLogin}>Login</Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="px-0">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
