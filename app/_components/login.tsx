'use client'
import {CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import Link from "next/link";
import {signIn} from "next-auth/react";
import {Mode} from "@/app/_components/landing-page";
import {AuthService, UserService} from "@/apis";
import {toast} from "@/components/ui/use-toast";

export function Login({setMode}: any) {
  const [login, setLogin] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState(false)

  async function handleLogin(e: any) {
    e.preventDefault();
    AuthService.login(login.email, login.password).then((user) => {
      toast({title: `Hello, ${user.name} :)`})
    }, (err) => {
      switch (err.code) {
        case 'auth/invalid-credential':
            toast({title: "Wrong email or password."})
            setError(true)
            break;
        case 'auth/user-not-found':
            toast({title: "User not found. Please contact to admin."})
            break;
        default:
            toast({title: "Something went wrong. Please contact to admin."})
            break;
      }
    })
  }

  return (
    <div className="w-full flex-center">
      <div className="w-full sm:max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold">Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleLogin}>
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
            {
              error &&
              <p className="text-red-500 text-sm">Wrong email or password.</p>
            }
            <Button className="w-full" type="submit" >Login</Button>
          </form>
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
