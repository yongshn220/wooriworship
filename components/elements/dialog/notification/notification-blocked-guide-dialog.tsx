"use client"

import { ModernDialog } from "@/components/ui/modern-dialog"
import { BellOff } from "lucide-react"

interface NotificationBlockedGuideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function detectBrowser(): string {
  if (typeof navigator === "undefined") return "unknown"
  const ua = navigator.userAgent
  if (/CriOS/i.test(ua)) return "chrome-ios"
  if (/iPhone|iPad|iPod/i.test(ua) && /Safari/i.test(ua)) return "safari-ios"
  if (/Macintosh.*Safari/i.test(ua) && !/Chrome/i.test(ua)) return "safari-macos"
  if (/Firefox/i.test(ua)) return "firefox"
  if (/Android/i.test(ua) && /Chrome/i.test(ua)) return "chrome-android"
  if (/Chrome/i.test(ua)) return "chrome-desktop"
  return "unknown"
}

function getBrowserInstructions(): JSX.Element {
  const browser = detectBrowser()

  const instructions: Record<string, string[]> = {
    "chrome-desktop": [
      "1. Click the lock icon in the address bar",
      "2. Select 'Site settings'",
      "3. Set Notifications to 'Allow'",
    ],
    "chrome-android": [
      "1. Tap the lock icon in the address bar",
      "2. Tap 'Permissions'",
      "3. Enable Notifications",
    ],
    "safari-macos": [
      "1. Open Safari menu > Settings",
      "2. Go to 'Websites' > 'Notifications'",
      "3. Find this site and select 'Allow'",
    ],
    "safari-ios": [
      "1. Open the Settings app",
      "2. Scroll to this app",
      "3. Enable 'Notifications'",
    ],
    firefox: [
      "1. Click the shield icon in the address bar",
      "2. Go to 'Permissions'",
      "3. Enable Notifications",
    ],
    unknown: [
      "Open your browser settings and search for notification permissions for this site.",
    ],
  }

  const steps = instructions[browser] || instructions.unknown

  return (
    <div className="mx-auto max-w-[280px] text-left">
      <div className="space-y-1 text-sm text-muted-foreground">
        {steps.map((step, index) => (
          <div key={index}>{step}</div>
        ))}
      </div>
    </div>
  )
}

export function NotificationBlockedGuideDialog({
  open,
  onOpenChange,
}: NotificationBlockedGuideDialogProps) {
  return (
    <ModernDialog
      variant="default"
      icon={<BellOff className="h-6 w-6" />}
      title="Notifications Are Blocked"
      description="To receive notifications, you'll need to update your browser settings."
      open={open}
      onOpenChange={onOpenChange}
      cancelText="Got It"
    >
      {getBrowserInstructions()}
    </ModernDialog>
  )
}
