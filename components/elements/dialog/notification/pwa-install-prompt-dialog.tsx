"use client"

import { ModernDialog } from "@/components/ui/modern-dialog"
import { Download, Share, MoreVertical, Plus, ArrowUp } from "lucide-react"

interface PwaInstallPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  canPromptInstall: boolean
  onInstall: () => void
}

function detectPlatform(): "ios" | "android" | "desktop" {
  if (typeof navigator === "undefined") return "desktop"
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios"
  if (/Android/i.test(ua)) return "android"
  return "desktop"
}

/* ── iOS Safari guide ── */
function IosSafariGuide() {
  return (
    <div className="w-full space-y-4">
      {/* Step 1: Safari bottom bar with Share button highlighted */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">1. Tap the Share button</p>
        <div className="rounded-xl border bg-muted/40 p-3">
          <div className="flex items-center justify-around">
            <div className="h-5 w-5 rounded bg-muted" />
            <div className="h-5 w-5 rounded bg-muted" />
            <div className="relative flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-2 ring-primary/40">
                <ArrowUp className="h-4 w-4 text-primary" />
              </div>
              <span className="mt-1 text-[10px] font-medium text-primary">Share</span>
            </div>
            <div className="h-5 w-5 rounded bg-muted" />
            <div className="h-5 w-5 rounded bg-muted" />
          </div>
        </div>
      </div>

      {/* Step 2: Share sheet with "Add to Home Screen" */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">2. Tap &quot;Add to Home Screen&quot;</p>
        <div className="rounded-xl border bg-muted/40 overflow-hidden">
          <div className="border-b px-3 py-2 text-xs text-muted-foreground">Copy</div>
          <div className="border-b px-3 py-2 text-xs text-muted-foreground">Add Bookmark</div>
          <div className="flex items-center gap-2.5 bg-primary/10 px-3 py-2 ring-1 ring-inset ring-primary/20">
            <Plus className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Add to Home Screen</span>
          </div>
          <div className="px-3 py-2 text-xs text-muted-foreground">Add to Reading List</div>
        </div>
      </div>

      {/* Step 3 */}
      <p className="text-xs text-muted-foreground">
        3. Tap <strong className="text-foreground">&quot;Add&quot;</strong> in the top right to install.
      </p>
    </div>
  )
}

/* ── Android Chrome guide ── */
function AndroidChromeGuide() {
  return (
    <div className="w-full space-y-4">
      {/* Step 1: Chrome top bar with menu */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">1. Tap the menu button</p>
        <div className="rounded-xl border bg-muted/40 p-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-full bg-muted px-3 py-1.5">
              <span className="text-[10px] text-muted-foreground">wooriworship.com</span>
            </div>
            <div className="relative flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-2 ring-primary/40">
                <MoreVertical className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Menu dropdown */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">2. Tap &quot;Install app&quot;</p>
        <div className="rounded-xl border bg-muted/40 overflow-hidden">
          <div className="border-b px-3 py-2 text-xs text-muted-foreground">New tab</div>
          <div className="border-b px-3 py-2 text-xs text-muted-foreground">Bookmarks</div>
          <div className="flex items-center gap-2.5 bg-primary/10 px-3 py-2 ring-1 ring-inset ring-primary/20">
            <Download className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Install app</span>
          </div>
          <div className="px-3 py-2 text-xs text-muted-foreground">Desktop site</div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        3. Tap <strong className="text-foreground">&quot;Install&quot;</strong> to confirm.
      </p>
    </div>
  )
}

/* ── Desktop Chrome / Edge guide ── */
function DesktopChromeGuide() {
  return (
    <div className="w-full space-y-4">
      {/* Step 1: Address bar with install icon */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">1. Click the install icon in the address bar</p>
        <div className="rounded-xl border bg-muted/40 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground">
              <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="8" /></svg>
            </div>
            <div className="flex-1 rounded-full bg-muted px-3 py-1.5">
              <span className="text-[10px] text-muted-foreground">wooriworship.com</span>
            </div>
            <div className="relative flex flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 ring-2 ring-primary/40">
                <Download className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="mt-0.5 text-[9px] font-medium text-primary">here</span>
            </div>
            <div className="h-5 w-5 rounded text-muted-foreground flex items-center justify-center">
              <MoreVertical className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Alternative */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">Or use the browser menu:</p>
        <div className="rounded-xl border bg-muted/40 overflow-hidden">
          <div className="border-b px-3 py-2 text-xs text-muted-foreground">New tab</div>
          <div className="flex items-center gap-2.5 bg-primary/10 px-3 py-2 ring-1 ring-inset ring-primary/20">
            <Download className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Install Woori Worship...</span>
          </div>
          <div className="px-3 py-2 text-xs text-muted-foreground">Settings</div>
        </div>
      </div>
    </div>
  )
}

function getInstallGuide(): JSX.Element {
  const platform = detectPlatform()
  if (platform === "ios") return <IosSafariGuide />
  if (platform === "android") return <AndroidChromeGuide />
  return <DesktopChromeGuide />
}

export function PwaInstallPromptDialog({
  open,
  onOpenChange,
  canPromptInstall,
  onInstall,
}: PwaInstallPromptDialogProps) {
  return (
    <ModernDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="primary"
      icon={<Download className="h-6 w-6" />}
      title="Install Woori Worship"
      description="Add the app to your home screen for a faster, full-screen experience."
      cancelText={canPromptInstall ? "Not Now" : "Got It"}
      actionText={canPromptInstall ? "Install" : undefined}
      onAction={canPromptInstall ? onInstall : undefined}
    >
      {getInstallGuide()}
    </ModernDialog>
  )
}
