import { AccountSetting, PushNotification, Subscription } from '@/models/account-setting';
import { getNewSubscription } from '@/components/util/helper/push-notification';
import { getFirebaseTimestampNow } from '@/components/util/helper/helper-functions';
import AccountSettingService from './AccountSettingService';

class PushNotificationService {
  async updateOptState(uid: string, isEnabled: boolean) {
    const setting = await AccountSettingService.getAccountSetting(uid);
    if (!setting) return;

    if (setting.push_notification.is_enabled === isEnabled) {
      return;
    } 

    const notif: PushNotification = {
      ...setting.push_notification,
      is_enabled: isEnabled,
      updated_time: getFirebaseTimestampNow()
    }

    await AccountSettingService.update(uid, {
      push_notification: notif
    });
  }

  async refreshSubscription(uid: string, deviceId: string) {
    if (!uid || !deviceId) {
      console.error("refreshSubscription: Missing uid or deviceId", { uid, deviceId });
      return;
    }

    console.log("Refreshing push notification subscription", { uid, deviceId });
    
    const setting = await AccountSettingService.getAccountSetting(uid);
    if (!setting) {
      console.error("Failed to get or create account setting");
      return;
    }

    try {
      // Get new subscription from service worker
      const newSub = await getNewSubscription();
      if (!newSub) {
        console.error("Failed to get new subscription from service worker");
        return;
      }

      // Filter out existing subscription for this device
      const filteredSubscriptions = setting.push_notification.subscriptions.filter(
        sub => sub.device_id !== deviceId
      );

      const subscription: Subscription = {
        device_id: deviceId,
        sub: newSub
      }

      const notif: PushNotification = {
        ...setting.push_notification, 
        subscriptions: [...filteredSubscriptions, subscription],
        updated_time: getFirebaseTimestampNow()
      }
      
      await AccountSettingService.update(uid, {
        push_notification: notif
      });

      console.log("Successfully updated push notification subscription", { deviceId });
    } 
    catch (error) {
      console.error("Error refreshing push notification subscription:", error);
    }
  }
}

export default new PushNotificationService(); 