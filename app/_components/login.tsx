
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
import { motion } from "framer-motion"
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

import { PasswordInput } from "./auth/password-input"

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Welcome Back</h1>
            <p className="text-slate-500 text-sm">
              Enter your credentials to access your workspace
            </p>
          </motion.div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@example.com"
                          className="bg-white/60 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              {form.formState.errors.root && (
                <motion.div variants={itemVariants} className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-100">
                  <p className="text-sm font-medium text-center">
                    {form.formState.errors.root.message}
                  </p>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02]"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </motion.div>
            </form>
          </Form>

          <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 text-sm pt-2">
            <Link
              className="text-slate-500 hover:text-slate-800 transition-colors underline-offset-4 hover:underline"
              href="#"
            >
              Forgot your password?
            </Link>
            <div className="text-slate-500">
              Don&apos;t have an account?{" "}
              <button
                className="font-semibold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-colors"
                onClick={() => setMode(LandingMode.SIGNUP)}
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

