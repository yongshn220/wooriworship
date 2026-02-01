"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { ModernDialog } from "@/components/ui/modern-dialog"
import { useNotificationPermission } from "@/components/util/hook/use-notification-permission"

interface NotificationPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPermissionResult?: (result: NotificationPermission) => void
}

export function NotificationPromptDialog({
  open,
  onOpenChange,
  onPermissionResult,
}: NotificationPromptDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { requestPermission } = useNotificationPermission()

  const handleEnableNotifications = async () => {
    setIsLoading(true)
    const result = await requestPermission()
    setIsLoading(false)

    if (result !== null) {
      onPermissionResult?.(result)
    }

    onOpenChange(false)
  }

  return (
    <ModernDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="primary"
      icon={<Bell className="h-6 w-6" />}
      title="Stay in the Loop"
      description="Get notified when new worship sets, service assignments, or team announcements are posted."
      cancelText="Not Now"
      actionText="Enable Notifications"
      isLoading={isLoading}
      onAction={handleEnableNotifications}
    />
  )
}
