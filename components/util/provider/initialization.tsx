import { useEffect } from "react"
import useLocalStorage from "../hook/use-local-storage";
import { useNotificationPermission } from "../hook/use-notification-permission";
import { v4 as uuid } from 'uuid';
import { isServiceWorkerSupported, registerServiceWorker } from "../helper/push-notification";
import { auth } from "@/firebase";
import PushNotificationApi from "@/apis/PushNotificationApi";
import AccountSettingApi from "@/apis/AccountSettingApi";

export interface LocalStorageUtility {
  deviceId: string
}

export default function Initialization() {
  const [utility, setUtility] = useLocalStorage<LocalStorageUtility>('utility', {
    deviceId: uuid()
  });
  const { permission } = useNotificationPermission();

  useEffect(() => {
    if (!utility.deviceId) return;

    if (!isServiceWorkerSupported()) {
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        return;
      }

      try {
        await registerServiceWorker();

        if (permission === "granted") {
          await PushNotificationApi.refreshSubscription(user.uid, utility.deviceId);
        } else if (permission === "denied" || permission === "default") {
          // Auto-sync: if OS permission is revoked but Firestore still has is_enabled=true, disable it
          const setting = await AccountSettingApi.getAccountSetting(user.uid);
          if (setting?.push_notification?.is_enabled) {
            await PushNotificationApi.updateOptState(user.uid, false);
          }
        }
      }
      catch (error) {
        console.error("Error in initialization:", error);
      }
    });

    return () => unsubscribe();
  }, [utility.deviceId, permission]);

  return (
    <>
    </>
  )
}
