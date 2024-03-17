"use client"

import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {useState} from "react";
import { useRecoilState } from "recoil"
import { currentUserAtom } from "@/states/userState"
import { useRouter } from 'next/router'
import { Routes } from "@/components/constants/enums"
import { AuthService, UserService } from "@/apis"

export default function AdminPage() {
  //const [currentUser, setCurrentUser] = useRecoilState(currentUserAtom)
  const [login, setLogin] = useState({
    email: "",
    password: "",
  })

  const [signup, setSignup] = useState({
    name: "",
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
    await AuthService.login(login.email, login.password).then(async currentUser => {
      alert("logged in!");
      console.log(currentUser);
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

  async function handleSignup() {
    console.log(signup.name)
    console.log(signup.email)
    console.log(signup.password)
    console.log(signup.confirmPassword)
    if(signup.password != signup.confirmPassword) {
      console.log("password and confirm password not same");
      return;
    } 
    if(signup.name.length == 0) {
      console.log("Name is not given")
      return;
    }
    await AuthService.register(signup.email, signup.password).then(async user => {
      if(user.user){
        const sessionUser = await UserService.addNewUser(user.user.uid, signup.email, signup.name);
        //여기에 userState 를 new user로 넣어야함
        console.log(sessionUser);
        alert("New user created");
      } else {
        alert("error occured");
      }
    }, err => {
        console.log(err.code);
        switch (err.code) {
            case 'auth/invalid-email':
                alert("email is invalid");
                break;
            case 'auth/email-already-in-use':
                alert("email is already in use");
                break;
            default:
                console.log(err.code);
                alert("there was error in creating account");
                break;
        }
    });
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
                <Label htmlFor="name">Name</Label>
                <Input id="signupName" required type="name" onChange={(e) => setSignup((prev) => ({...prev, name: e.target.value}))}/>
              </div>
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
