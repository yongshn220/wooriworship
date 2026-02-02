"use client"

import { useEffect, useState, useRef, useCallback } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function usePwaInstall() {
  const [isStandalone, setIsStandalone] = useState(true) // default true to avoid flash
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)
  const [canPromptInstall, setCanPromptInstall] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Detect standalone mode
    const isIosStandalone = (navigator as any).standalone === true
    const isDisplayStandalone = window.matchMedia("(display-mode: standalone)").matches
    setIsStandalone(isIosStandalone || isDisplayStandalone)

    // Listen for display-mode changes (e.g., user installs while on the page)
    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    const handleChange = (e: MediaQueryListEvent) => setIsStandalone(e.matches)
    mediaQuery.addEventListener("change", handleChange)

    // Capture Chrome/Edge beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e as BeforeInstallPromptEvent
      setCanPromptInstall(true)
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<boolean> => {
    const prompt = deferredPromptRef.current
    if (!prompt) return false

    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    deferredPromptRef.current = null
    setCanPromptInstall(false)
    return outcome === "accepted"
  }, [])

  return { isStandalone, canPromptInstall, promptInstall }
}
