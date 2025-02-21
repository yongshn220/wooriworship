
import {urlBase64ToUint8Array} from "@/components/util/helper/helper-functions";

export async function registerServiceWorker() {
  await navigator.serviceWorker.register('/sw.js', {
    scope: '/',
    updateViaCache: 'none',
  })
}

export function isServiceWorkerSupported() {
  return ('serviceWorker' in navigator && 'PushManager' in window)
}

export async function getNewSubscription() {
  const registration = await navigator.serviceWorker.ready
  const sub = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    ),
  })
  return JSON.parse(JSON.stringify(sub))
}

