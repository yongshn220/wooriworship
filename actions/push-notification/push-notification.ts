'use server'

import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:yongshn220@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  url?: string
}

export async function sendNotificationToSubscription(subscription: any, payload: PushNotificationPayload) {
  if (!subscription) {
    throw new Error('Invalid subscription')
  }

  // Prevent sending notifications in staging environment
  if (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID === 'stg-env') {
    console.log("🚫 [Staging] Skipped sending push notification.");
    return { success: true };
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icon.png',
        url: payload.url,
      })
    )
    return { success: true, gone: false, endpoint: '' }
  } catch (error: any) {
    const statusCode = error?.statusCode;
    if (statusCode === 410 || statusCode === 404) {
      console.warn('Stale subscription detected:', subscription.endpoint);
      return { success: false, gone: true, endpoint: subscription.endpoint }
    }
    console.error('Error sending push notification:', error)
    return { success: false, gone: false, endpoint: '' }
  }
}

export async function sendNotificationToMultipleSubscriptions(subscriptions: PushSubscription[], payload: PushNotificationPayload) {
  const results = await Promise.allSettled(
    subscriptions.map(subscription => sendNotificationToSubscription(subscription, payload))
  );

  const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
  const failed = results.filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)).length;

  const staleEndpoints = results
    .filter(result => result.status === 'fulfilled' && result.value.gone)
    .map(result => (result as PromiseFulfilledResult<any>).value.endpoint as string)
    .filter(Boolean);

  return {
    success: successful > 0,
    stats: { successful, failed },
    staleEndpoints,
  };
}