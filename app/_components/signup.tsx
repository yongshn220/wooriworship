'use client'

import {CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import { AuthService, UserService } from "@/apis"
import {Mode} from "@/app/_components/landing-page";

export function Signup({setMode}: any) {
    const [signup, setSignup] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })


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
    <div className="w-full flex-center">
      <div className="w-full sm:max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
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
