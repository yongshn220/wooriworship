'use client'
import {CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import Link from "next/link";
import {Mode} from "@/app/page";
import {useRouter} from "next/navigation";
import {Routes} from "@/components/constants/enums";
import { AuthService, UserService } from "@/apis"

export function Login({setMode}: any) {
  const router = useRouter()

  const [login, setLogin] = useState({
    email: "",
    password: "",
  })

  async function handleLogin() {
    console.log(login.email)
    console.log(login.password)
    await AuthService.login(login.email, login.password).then(async currentUser => {
      alert("logged in!");
      console.log(currentUser);
      router.replace(Routes.PLAN)
      //여기다 setCurrentUser(currentUser)
    }, err => {
      console.log(err.code);
    switch (err.code) {
        case 'auth/invalid-credential':
            alert("email or password is invalid");
            break;
        case 'auth/user-not-found':
            alert("User is not found");
            break;
        default:
            alert("There was error in logging in");
            break;
    }
    });
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
