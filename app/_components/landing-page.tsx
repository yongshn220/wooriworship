"use client"

import { MainLogoRouter } from "@/components/elements/util/logo/main-logo"
import { Login } from "@/app/_components/login"
import { Signup } from "@/app/_components/signup"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

export enum LandingMode {
  LOGIN,
  SIGNUP,
}

export function LandingPage() {
  const [mode, setMode] = useState(LandingMode.LOGIN)

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-white">
      {/* Left Panel: Branding & Visuals */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-blue-600 to-indigo-900 text-white p-12 flex-col justify-between">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-full h-full bg-white/5 rounded-full blur-3xl transform -translate-y-1/2" />
          <div className="absolute bottom-0 -right-1/4 w-full h-full bg-white/10 rounded-full blur-3xl transform translate-y-1/3" />
        </div>

        <div className="relative z-10">
          <MainLogoRouter route="/" />
        </div>

        <div className="relative z-10 flex flex-col items-start gap-6 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Image
              alt="compose music image"
              src="/illustration/composeMusic.svg"
              width={400}
              height={400}
              className="mb-8 drop-shadow-2xl"
            />
            <h1 className="text-5xl font-bold tracking-tight mb-4 leading-tight">
              Manage your worship team <br />
              <span className="text-blue-200">like a pro.</span>
            </h1>
            <p className="text-xl text-blue-100/90 leading-relaxed">
              Create setlists, plan worship services, and share resources with your team seamlessly.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 text-sm text-blue-200/60">
          © {new Date().getFullYear()} WooriWorship. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Auth Forms */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 bg-gray-50 relative">
        <div className="lg:hidden absolute top-6 left-6">
          <MainLogoRouter route="/" />
        </div>

        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === LandingMode.LOGIN ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === LandingMode.LOGIN ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {mode === LandingMode.LOGIN ? (
                <Login setMode={setMode} />
              ) : (
                <Signup setMode={setMode} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

