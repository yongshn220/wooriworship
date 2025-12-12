import { AccountSetting, PushNotification, Subscription } from '@/models/account-setting';
import { getNewSubscription } from '@/components/util/helper/push-notification';
import { getFirebaseTimestampNow } from '@/components/util/helper/helper-functions';
import AccountSettingService from './AccountSettingService';
import { sendNotificationToMultipleSubscriptions, PushNotificationPayload } from '@/actions/push-notification/push-notification';
import TeamService from './TeamService';
import { Team } from '@/models/team';

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
        sub: JSON.stringify(newSub)  // Convert subscription to string before storing
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

  async notifyTeamNewWorship(teamId: string, creatorUid: string, worshipDate: Date, worshipTitle: string) {
    try {
      // Get team data to get member UIDs
      const team = await TeamService.getById(teamId) as Team;
      if (!team) {
        console.error("Team not found", { teamId });
        return;
      }

      // Get all team members' account settings except the creator
      const memberUids = team.users.filter(uid => uid !== creatorUid);
      const memberSettings = await Promise.all(
        memberUids.map(uid => AccountSettingService.getAccountSetting(uid))
      );

      // Collect all active subscriptions from members who have enabled notifications
      const activeSubscriptions = memberSettings
        .filter(setting => setting && setting.push_notification.is_enabled)
        .flatMap(setting => setting.push_notification.subscriptions)
        .map(sub => JSON.parse(sub.sub) as PushSubscription);

      if (activeSubscriptions.length === 0) {
        console.log("No active subscriptions found for team members");
        return;
      }

      // Format the date for the notification
      const formattedDate = worshipDate.toLocaleDateString();

      // Send the notification
      const payload: PushNotificationPayload = {
        title: "New Worship Created",
        body: `${worshipTitle} on ${formattedDate}`,
        icon: '/icon.png'
      };

      const result = await sendNotificationToMultipleSubscriptions(activeSubscriptions, payload);
      console.log("Notification sending result:", result);

      return result;
    }
    catch (error) {
      console.error("Error sending team notifications:", error);
      return { success: false, error: "Failed to send notifications" };
    }
  }

  async notifyTeamNewNotice(teamId: string, creatorUid: string, noticeTitle: string) {
    try {
      const team = await TeamService.getById(teamId) as Team;
      if (!team) return;

      const memberUids = team.users.filter(uid => uid !== creatorUid);
      const memberSettings = await Promise.all(
        memberUids.map(uid => AccountSettingService.getAccountSetting(uid))
      );

      const activeSubscriptions = memberSettings
        .filter(setting => setting && setting.push_notification.is_enabled)
        .flatMap(setting => setting.push_notification.subscriptions)
        .map(sub => JSON.parse(sub.sub) as PushSubscription);

      if (activeSubscriptions.length === 0) return;

      const payload: PushNotificationPayload = {
        title: "New Notice Posted",
        body: noticeTitle,
        icon: '/icon.png'
      };

      return await sendNotificationToMultipleSubscriptions(activeSubscriptions, payload);
    } catch (error) {
      console.error("Error sending notice notifications:", error);
    }
  }

  async notifyMembersServingAssignment(teamId: string, creatorUid: string, servingDate: Date, assignedMemberIds: string[]) {
    try {
      // Filter out creator if they assigned themselves (optional, usually one wants to notify others)
      const targetMemberIds = assignedMemberIds.filter(uid => uid !== creatorUid);

      if (targetMemberIds.length === 0) return;

      const memberSettings = await Promise.all(
        targetMemberIds.map(uid => AccountSettingService.getAccountSetting(uid))
      );

      const activeSubscriptions = memberSettings
        .filter(setting => setting && setting.push_notification.is_enabled)
        .flatMap(setting => setting.push_notification.subscriptions)
        .map(sub => JSON.parse(sub.sub) as PushSubscription);

      if (activeSubscriptions.length === 0) return;

      const formattedDate = servingDate.toLocaleDateString();

      const payload: PushNotificationPayload = {
        title: "New Serving Assignment",
        body: `You are assigned to serve on ${formattedDate}`,
        icon: '/icon.png'
      };

      return await sendNotificationToMultipleSubscriptions(activeSubscriptions, payload);
    } catch (error) {
      console.error("Error sending serving notifications:", error);
    }
  }
}

export default new PushNotificationService(); 