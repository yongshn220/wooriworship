
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LandingMode } from "@/app/_components/landing-page"
import { AuthService } from "@/apis"
import { toast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LoginFormValues, LoginSchema } from "./auth/auth-schema"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export function Login({ setMode }: { setMode: (mode: LandingMode) => void }) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    try {
      const user = await AuthService.login(data.email, data.password)
      toast({ title: `Hello, ${user.name} :)` })
    } catch (err: any) {
      switch (err.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          form.setError("root", {
            message: "Invalid email or password.",
          })
          break
        default:
          toast({
            title: "Something went wrong.",
            description: "Please contact support.",
            variant: "destructive",
          })
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
          <h1 className="text-3xl font-bold tracking-tighter">Welcome Back</h1>
          <p className="text-gray-500 text-sm">
            Enter your credentials to access your workspace
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            {form.formState.errors.root && (
              <p className="text-sm font-medium text-destructive text-center">
                {form.formState.errors.root.message}
              </p>
            )}

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </Form>

        <div className="flex flex-col items-center gap-4 text-sm">
          <Link
            className="text-gray-500 hover:text-gray-900 transition-colors underline-offset-4 hover:underline"
            href="#"
          >
            Forgot your password?
          </Link>
          <div className="text-gray-500">
            Don&apos;t have an account?{" "}
            <button
              className="font-semibold text-primary underline-offset-4 hover:underline"
              onClick={() => setMode(LandingMode.SIGNUP)}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

