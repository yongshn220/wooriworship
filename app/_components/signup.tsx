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
import { motion } from "framer-motion"

import { PasswordInput } from "./auth/password-input"
import { PasswordStrength } from "./auth/password-strength"

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

  // Watch password for strength meter
  const password = form.watch("password");

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

        // 3. Send Verification Email
        await AuthService.sendEmailVerification(userCredential.user);

        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
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
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Create Account</h1>
            <p className="text-slate-500 text-sm">
              Join your team and start planning worship together
            </p>
          </motion.div>

          {/* Form wrapper */}
          <div className="max-h-[70vh] overflow-y-auto px-1 -mx-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" className="bg-white/60 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-300" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

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
                        {/* Strength Meter */}
                        <div className="mt-2">
                          <PasswordStrength password={password} />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Confirm Password</FormLabel>
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

                <motion.div variants={itemVariants} className="pt-2">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02]"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign Up
                  </Button>
                </motion.div>
              </form>
            </Form>
          </div>

          <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 text-sm pt-2">
            <div className="text-slate-500">
              Already have an account?{" "}
              <button
                className="font-semibold text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transition-colors"
                onClick={() => setMode(LandingMode.LOGIN)}
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
