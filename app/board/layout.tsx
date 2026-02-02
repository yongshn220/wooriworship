"use client"

import { BoardAuthenticate } from "@/app/board/_components/auth/board-authenticate";
import { BoardTopNavBar } from "@/app/board/_components/board-navigation/board-top-nav-bar/board-top-nav-bar";
import { BoardBottomNavBar } from "@/app/board/_components/board-navigation/board-bottom-nav-bar/board-bottom-nav-bar";
import { usePathname } from "next/navigation";
import { useSetRecoilState } from "recoil";
import { currentPageAtom } from "@/global-states/page-state";
import { useEffect, useState, useRef } from "react";
import { Page } from "@/components/constants/enums";
import { DialogManager } from "@/components/elements/dialog/static-dialog/dialog-manager";
import Initialization from "@/components/util/provider/initialization";
import useLocalStorage from "@/components/util/hook/use-local-storage";
import { useNotificationPermission } from "@/components/util/hook/use-notification-permission";
import { usePwaInstall } from "@/components/util/hook/use-pwa-install";
import { NotificationPromptDialog } from "@/components/elements/dialog/notification/notification-prompt-dialog";
import { PwaInstallPromptDialog } from "@/components/elements/dialog/notification/pwa-install-prompt-dialog";
import PushNotificationApi from "@/apis/PushNotificationApi";
import { auth } from "@/firebase";
import { ScrollContainerContext } from "@/app/board/_contexts/scroll-container-context";


export default function BoardLayout({ children }: { children: React.ReactNode }) {
  const setPage = useSetRecoilState(currentPageAtom)
  const pathname = usePathname()
  const { permission } = useNotificationPermission()
  const [notificationPromptStorage, setNotificationPromptStorage] = useLocalStorage('notification_prompt_dismissed', false)
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)
  const { isStandalone, canPromptInstall, promptInstall } = usePwaInstall()
  const [pwaPromptStorage, setPwaPromptStorage] = useLocalStorage('pwa_install_prompt_dismissed', false)
  const [showPwaInstallPrompt, setShowPwaInstallPrompt] = useState(false)
  const mainRef = useRef<HTMLElement>(null)


  useEffect(() => {
    // Global Navigation Cleanup:
    // When navigating between pages, ensure any lingering body locks (from closed/unmounted modals) are removed.
    // This addresses issues where libraries like 'vaul' might leave pointer-events: none on the body if navigation happens rapidly.
    if (document.body.style.pointerEvents === 'none') {
      document.body.style.removeProperty('pointer-events');
    }

    if (/^\/board$/.test(pathname)) {
      setPage(Page.BOARD)
    }
  }, [pathname, setPage])

  useEffect(() => {
    if (permission === "default" && !notificationPromptStorage) {
      const timer = setTimeout(() => setShowNotificationPrompt(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [permission, notificationPromptStorage])

  // Show PWA install prompt after notification prompt is handled
  const notificationPromptDone = notificationPromptStorage || permission !== "default"
  useEffect(() => {
    if (!notificationPromptDone || isStandalone || pwaPromptStorage || showNotificationPrompt) return
    const timer = setTimeout(() => setShowPwaInstallPrompt(true), 2500)
    return () => clearTimeout(timer)
  }, [notificationPromptDone, isStandalone, pwaPromptStorage, showNotificationPrompt])

  function handleNotificationPermissionResult(result: NotificationPermission) {
    setNotificationPromptStorage(true)
    if (result === "granted") {
      const uid = auth.currentUser?.uid
      if (uid) {
        PushNotificationApi.updateOptState(uid, true)
      }
    }
  }

  function handleNotificationPromptClose(open: boolean) {
    if (!open) {
      setNotificationPromptStorage(true)
      setShowNotificationPrompt(false)
    }
  }

  function handlePwaPromptClose(open: boolean) {
    if (!open) {
      setPwaPromptStorage(true)
      setShowPwaInstallPrompt(false)
    }
  }

  async function handlePwaInstall() {
    const accepted = await promptInstall()
    setPwaPromptStorage(true)
    setShowPwaInstallPrompt(false)
  }

  return (
    <section className="h-full">
      <BoardAuthenticate>
        <ScrollContainerContext.Provider value={mainRef}>
          <Initialization />
          <DialogManager />
          <NotificationPromptDialog
            open={showNotificationPrompt}
            onOpenChange={handleNotificationPromptClose}
            onPermissionResult={handleNotificationPermissionResult}
          />
          <PwaInstallPromptDialog
            open={showPwaInstallPrompt}
            onOpenChange={handlePwaPromptClose}
            canPromptInstall={canPromptInstall}
            onInstall={handlePwaInstall}
          />
          <div className="flex flex-col h-full">
            <BoardTopNavBar />
            <main ref={mainRef} className="flex-grow min-h-0 overflow-y-auto bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] overscroll-contain">
              {children}
            </main>
            <BoardBottomNavBar />
          </div>
        </ScrollContainerContext.Provider>
      </BoardAuthenticate>
    </section>
  )
}
