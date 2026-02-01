"use client";

import { useEffect, useState } from "react";

export type NotificationPermissionState =
  | "default"
  | "granted"
  | "denied"
  | "unsupported";

export function useNotificationPermission() {
  const [permission, setPermission] =
    useState<NotificationPermissionState>("unsupported");

  useEffect(() => {
    // Check for browser support
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    // Read initial permission state
    setPermission(Notification.permission as NotificationPermissionState);

    // Try to listen for permission changes via Permissions API
    let permissionStatus: PermissionStatus | null = null;
    let visibilityChangeHandler: (() => void) | null = null;

    const updatePermission = () => {
      if ("Notification" in window) {
        setPermission(Notification.permission as NotificationPermissionState);
      }
    };

    // Try modern Permissions API (not supported in Safari)
    navigator.permissions
      ?.query({ name: "notifications" as PermissionName })
      .then((status) => {
        permissionStatus = status;
        status.onchange = updatePermission;
      })
      .catch(() => {
        // Fallback: listen to visibility change for Safari and browsers without Permissions API
        visibilityChangeHandler = () => {
          if (document.visibilityState === "visible") {
            updatePermission();
          }
        };
        document.addEventListener("visibilitychange", visibilityChangeHandler);
      });

    // Cleanup
    return () => {
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
      if (visibilityChangeHandler) {
        document.removeEventListener(
          "visibilitychange",
          visibilityChangeHandler
        );
      }
    };
  }, []);

  const requestPermission = async (): Promise<NotificationPermission | null> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return null;
    }

    const result = await Notification.requestPermission();
    setPermission(result as NotificationPermissionState);
    return result;
  };

  return { permission, requestPermission };
}
