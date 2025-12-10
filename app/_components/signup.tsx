"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LandingMode } from "@/app/_components/landing-page"
import { AuthService, UserService } from "@/apis"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { SignupFormValues, SignupSchema } from "./auth/auth-schema"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

export function Signup({ setMode }: { setMode: (mode: LandingMode) => void }) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true)
    try {
      // 1. Register with Firebase Auth
      const userCredential = await AuthService.register(data.email, data.password)

      if (userCredential.user) {
        // 2. Create user record in DB
        await UserService.addNewUser(
          userCredential.user.uid,
          data.email,
          data.name
        )

        toast({
          title: "Account created successfully!",
          description: "Welcome to Worship Team Manager.",
        })

        // Mode will likely change via parent state or global auth listener, 
        // but explicit feedback is good.
      }
    } catch (err: any) {
      switch (err.code) {
        case "auth/email-already-in-use":
          form.setError("email", {
            message: "Email is already in use.",
          })
          break
        case "auth/invalid-email":
          form.setError("email", {
            message: "Invalid email address.",
          })
          break
        case "auth/weak-password":
          form.setError("password", {
            message: "Password is too weak.",
          })
          break
        default:
          toast({
            title: "Error creating account",
            description: "Please try again later.",
            variant: "destructive",
          })
          console.error(err) // acceptable for unknown errors, but avoid logging PII
          break
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/50 backdrop-blur-md border border-white/20 rounded-xl shadow-xl p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">Create Account</h1>
          <p className="text-gray-500 text-sm">
            Join your team and start planning worship together
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="bg-white/50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      className="bg-white/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••"
                      className="bg-white/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••"
                      className="bg-white/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </Form>

        <div className="flex flex-col items-center gap-4 text-sm">
          <div className="text-gray-500">
            Already have an account?{" "}
            <button
              className="font-semibold text-primary underline-offset-4 hover:underline"
              onClick={() => setMode(LandingMode.LOGIN)}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
