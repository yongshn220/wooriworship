export interface AccountSetting {
  id?: string
  uid: string
  push_notification: PushNotification
}

export interface PushNotification {
  is_enabled: boolean
  updated_time: any  // Firebase Timestamp
  subscriptions: Subscription[]
}

export interface Subscription {
  device_id: string
  sub: string
}