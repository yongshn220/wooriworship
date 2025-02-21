import { useEffect } from "react"
import useLocalStorage from "../hook/use-local-storage";
import { v4 as uuid } from 'uuid';
import { isServiceWorkerSupported, registerServiceWorker } from "../helper/push-notification";
import { auth } from "@/firebase";
import PushNotificationService from "@/apis/PushNotificationService";

export interface LocalStorageUtility {
  deviceId: string
}

export default function Initialization() {
  const [utility, setUtility] = useLocalStorage<LocalStorageUtility>('utility', {
    deviceId: uuid()
  });

  useEffect(() => {
    if (!utility.deviceId) return;
    
    if (!isServiceWorkerSupported()) {
      console.log("Service Worker is not supported");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      console.log("User not authenticated");
      return;
    }

    (async () => {
      try {
        await registerServiceWorker();
        console.log("Service Worker registered, refreshing subscription for user:", user.uid);
        await PushNotificationService.refreshSubscription(user.uid, utility.deviceId);
        console.log("Push notification subscription refreshed successfully");
      } 
      catch (error) {
        console.error("Error in initialization:", error);
      }
    })();
  }, [utility.deviceId, auth.currentUser]);

  return (
    <>
    </>
  )
}
