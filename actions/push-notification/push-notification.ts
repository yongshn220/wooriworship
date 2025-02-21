'use server'
 
import webpush from 'web-push'
 
webpush.setVapidDetails(
  'mailto:yongshn220@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)
 
let subscription: PushSubscription = null
 
export async function subscribeUser(sub: PushSubscription) {
  subscription = sub
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true }
}
 
export async function unsubscribeUser() {
  subscription = null
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true }
}
 
export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
}
 
export async function sendNotificationToSubscription(subscription: PushSubscription, payload: PushNotificationPayload) {
  if (!subscription) {
    throw new Error('Invalid subscription')
  }
 
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icon.png',
      })
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}

export async function sendNotificationToMultipleSubscriptions(subscriptions: PushSubscription[], payload: PushNotificationPayload) {
  const results = await Promise.allSettled(
    subscriptions.map(subscription => sendNotificationToSubscription(subscription, payload))
  );

  const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
  const failed = results.filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)).length;

  return {
    success: successful > 0,
    stats: { successful, failed }
  };
}