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
    <div className="min-h-screen w-full flex overflow-hidden bg-background relative selection:bg-primary/20">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-[120px] mix-blend-multiply animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-100/50 blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-sky-100/40 blur-[100px] mix-blend-multiply" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay" />
      </div>

      {/* Left Panel: Branding & Visuals */}
      <div className="hidden lg:flex w-1/2 relative bg-transparent text-foreground p-12 flex-col justify-between z-10 border-r border-border/50 backdrop-blur-sm">
        <div className="relative z-10">
          <MainLogoRouter route="/" />
        </div>

        <div className="relative z-10 flex flex-col items-start gap-8 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative mb-12 group perspective-1000">
              {/* 3D-ish Image Container */}
              <motion.div
                whileHover={{ rotateY: 5, rotateX: 5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border/60 bg-card/40 backdrop-blur-md p-6"
              >
                <Image
                  alt="compose music image"
                  src="/illustration/composeMusic.svg"
                  width={400}
                  height={400}
                  className="w-full h-auto drop-shadow-xl"
                />

                {/* Glass Glint Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute -z-10 top-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-blob" />
              <div className="absolute -z-10 -bottom-10 -left-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl animate-blob animation-delay-2000" />
            </div>

            <h1 className="text-6xl font-bold tracking-tight mb-6 leading-[1.1] text-foreground">
              Manage your <br />
              worship team <br />
              <span className="text-primary">like a pro.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              Seamlessly create setlists, plan services, and empower your team with resources—all in one beautiful workspace.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 text-sm text-muted-foreground font-light flex items-center gap-2">
          <span>© {new Date().getFullYear()} WooriWorship</span>
          <span className="w-1 h-1 bg-primary rounded-full" />
          <span>Crafted for excellence</span>
        </div>
      </div>

      {/* Right Panel: Auth Forms */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="lg:hidden absolute top-6 left-6 z-20">
          <MainLogoRouter route="/" />
        </div>

        <div className="w-full max-w-md relative">
          {/* Form Container Background Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-indigo-400/30 rounded-[3rem] blur-2xl opacity-40 pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === LandingMode.LOGIN ? -20 : 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: mode === LandingMode.LOGIN ? 20 : -20, filter: "blur(10px)" }}
              transition={{ duration: 0.4, type: "spring", stiffness: 100, damping: 20 }}
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

