"use client"

import { ModernDialog } from "@/components/ui/modern-dialog"
import { BellOff, Lock, MoreVertical, Bell, Shield } from "lucide-react"

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

/* ── Chrome Desktop guide ── */
function ChromeDesktopGuide() {
  return (
    <div className="w-full space-y-4">
      {/* Step 1: Address bar with lock icon */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">1. Click the lock icon in the address bar</p>
        <div className="rounded-xl border bg-muted/40 p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 ring-2 ring-primary/40">
                <Lock className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="mt-0.5 text-[9px] font-medium text-primary">here</span>
            </div>
            <div className="flex-1 rounded-full bg-muted px-3 py-1.5">
              <span className="text-[10px] text-muted-foreground">wooriworship.com</span>
            </div>
            <div className="h-5 w-5 rounded text-muted-foreground flex items-center justify-center">
              <MoreVertical className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Site settings */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">2. Select &quot;Site settings&quot;</p>
        <div className="rounded-xl border bg-muted/40 overflow-hidden">
          <div className="border-b px-3 py-2 text-xs text-muted-foreground">Connection is secure</div>
          <div className="border-b px-3 py-2 text-xs text-muted-foreground">Cookies and site data</div>
          <div className="flex items-center gap-2.5 bg-primary/10 px-3 py-2 ring-1 ring-inset ring-primary/20">
            <span className="text-xs font-semibold text-primary">Site settings</span>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">3. Set Notifications to &quot;Allow&quot;</p>
        <div className="rounded-xl border bg-muted/40 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Notifications</span>
            </div>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">Allow</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Chrome Android guide ── */
function ChromeAndroidGuide() {
  return (
    <div className="w-full space-y-4">
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">1. Tap the lock icon in the address bar</p>
        <div className="rounded-xl border bg-muted/40 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 ring-2 ring-primary/40">
              <Lock className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 rounded-full bg-muted px-3 py-1.5">
              <span className="text-[10px] text-muted-foreground">wooriworship.com</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">2. Tap &quot;Permissions&quot;</p>
        <div className="rounded-xl border bg-muted/40 overflow-hidden">
          <div className="border-b px-3 py-2 text-xs text-muted-foreground">Connection is secure</div>
          <div className="flex items-center gap-2.5 bg-primary/10 px-3 py-2 ring-1 ring-inset ring-primary/20">
            <span className="text-xs font-semibold text-primary">Permissions</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">3. Enable Notifications</p>
        <div className="rounded-xl border bg-muted/40 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Notifications</span>
            </div>
            <div className="h-5 w-9 rounded-full bg-primary relative">
              <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Safari macOS guide ── */
function SafariMacGuide() {
  return (
    <div className="w-full space-y-4">
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">1. Open Safari menu &gt; Settings</p>
        <div className="rounded-xl border bg-muted/40 overflow-hidden">
          <div className="border-b px-3 py-2 text-xs font-semibold text-foreground">Safari</div>
          <div className="border-b px-3 py-2 text-xs text-muted-foreground">About Safari</div>
          <div className="flex items-center gap-2.5 bg-primary/10 px-3 py-2 ring-1 ring-inset ring-primary/20">
            <span className="text-xs font-semibold text-primary">Settings...</span>
          </div>
          <div className="px-3 py-2 text-xs text-muted-foreground">Extensions</div>
        </div>
      </div>

      <p className="text-xs font-medium text-foreground">
        2. Go to <strong>&quot;Websites&quot;</strong> tab &gt; <strong>&quot;Notifications&quot;</strong>
      </p>

      <p className="text-xs text-muted-foreground">
        3. Find <strong className="text-foreground">wooriworship.com</strong> and select <strong className="text-foreground">&quot;Allow&quot;</strong>
      </p>
    </div>
  )
}

/* ── Safari iOS guide ── */
function SafariIosGuide() {
  return (
    <div className="w-full space-y-4">
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">1. Open the Settings app on your device</p>
        <div className="rounded-xl border bg-muted/40 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <span className="text-xs font-medium text-foreground">Settings</span>
          </div>
        </div>
      </div>

      <p className="text-xs font-medium text-foreground">
        2. Scroll down and find <strong>&quot;Woori Worship&quot;</strong>
      </p>

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">3. Enable &quot;Notifications&quot;</p>
        <div className="rounded-xl border bg-muted/40 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-medium text-foreground">Allow Notifications</span>
            <div className="h-5 w-9 rounded-full bg-primary relative">
              <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Firefox guide ── */
function FirefoxGuide() {
  return (
    <div className="w-full space-y-4">
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">1. Click the shield icon in the address bar</p>
        <div className="rounded-xl border bg-muted/40 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 ring-2 ring-primary/40">
              <Shield className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 rounded-full bg-muted px-3 py-1.5">
              <span className="text-[10px] text-muted-foreground">wooriworship.com</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs font-medium text-foreground">
        2. Go to <strong>&quot;Permissions&quot;</strong>
      </p>

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">3. Enable Notifications</p>
        <div className="rounded-xl border bg-muted/40 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Notifications</span>
            </div>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">Allow</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Fallback ── */
function FallbackGuide() {
  return (
    <div className="w-full space-y-2">
      <p className="text-xs text-muted-foreground">
        Open your browser settings and search for <strong className="text-foreground">&quot;notification permissions&quot;</strong> for this site.
      </p>
      <p className="text-xs text-muted-foreground">
        Look for <strong className="text-foreground">wooriworship.com</strong> and change the setting to <strong className="text-foreground">&quot;Allow&quot;</strong>.
      </p>
    </div>
  )
}

function getBrowserGuide(): JSX.Element {
  const browser = detectBrowser()
  switch (browser) {
    case "chrome-desktop": return <ChromeDesktopGuide />
    case "chrome-android": return <ChromeAndroidGuide />
    case "safari-macos": return <SafariMacGuide />
    case "safari-ios": return <SafariIosGuide />
    case "chrome-ios": return <SafariIosGuide />
    case "firefox": return <FirefoxGuide />
    default: return <FallbackGuide />
  }
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
      {getBrowserGuide()}
    </ModernDialog>
  )
}
