import { AccountSetting, Subscription } from '@/models/account-setting';
import { getNewSubscription } from '@/components/util/helper/push-notification';
import { getFirebaseTimestampNow } from '@/components/util/helper/helper-functions';
import AccountSettingApi from './AccountSettingApi';
import { sendNotificationToMultipleSubscriptions, PushNotificationPayload } from '@/actions/push-notification/push-notification';
import TeamApi from './TeamApi';
import { Team } from '@/models/team';

interface EndpointOwner {
  uid: string;
  deviceId: string;
}

class PushNotificationApi {
  async updateOptState(uid: string, isEnabled: boolean) {
    const setting = await AccountSettingApi.getAccountSetting(uid);
    if (!setting) return;

    if (setting.push_notification.is_enabled === isEnabled) {
      return;
    }

    await AccountSettingApi.update(uid, {
      push_notification: {
        ...setting.push_notification,
        is_enabled: isEnabled,
        updated_time: getFirebaseTimestampNow()
      }
    });
  }

  async refreshSubscription(uid: string, deviceId: string) {
    if (!uid || !deviceId) {
      console.error("refreshSubscription: Missing uid or deviceId", { uid, deviceId });
      return;
    }

    const setting = await AccountSettingApi.getAccountSetting(uid);
    if (!setting) {
      console.error("Failed to get or create account setting");
      return;
    }

    try {
      const newSub = await getNewSubscription();
      if (!newSub) {
        console.error("Failed to get new subscription from service worker");
        return;
      }

      const filteredSubscriptions = setting.push_notification.subscriptions.filter(
        sub => sub.device_id !== deviceId
      );

      const subscription: Subscription = {
        device_id: deviceId,
        sub: JSON.stringify(newSub)
      }

      await AccountSettingApi.update(uid, {
        push_notification: {
          ...setting.push_notification,
          subscriptions: [...filteredSubscriptions, subscription],
          updated_time: getFirebaseTimestampNow()
        }
      });
    }
    catch (error) {
      console.error("Error refreshing push notification subscription:", error);
    }
  }

  async notifyTeamNewNotice(teamId: string, creatorUid: string, noticeTitle: string, url?: string) {
    try {
      const team = await TeamApi.getById(teamId) as Team;
      if (!team) return;

      const memberUids = team.users.filter(uid => uid !== creatorUid);
      const memberSettings = await Promise.all(
        memberUids.map(uid => AccountSettingApi.getAccountSetting(uid))
      );

      const { activeSubscriptions, endpointOwnerMap } = this.collectSubscriptions(memberSettings, memberUids);
      if (activeSubscriptions.length === 0) return;

      const payload: PushNotificationPayload = {
        title: "New Notice Posted",
        body: noticeTitle,
        icon: '/icon.png',
        url,
      };

      const result = await sendNotificationToMultipleSubscriptions(activeSubscriptions, payload);
      await this.cleanupStaleSubscriptions(memberSettings, memberUids, endpointOwnerMap, result.staleEndpoints);
      return result;
    } catch (error) {
      console.error("Error sending notice notifications:", error);
    }
  }

  async notifyTeamSetlistUpdate(teamId: string, creatorUid: string, url?: string) {
    try {
      const team = await TeamApi.getById(teamId) as Team;
      if (!team) return;

      const memberUids = team.users.filter(uid => uid !== creatorUid);
      const memberSettings = await Promise.all(
        memberUids.map(uid => AccountSettingApi.getAccountSetting(uid))
      );

      const { activeSubscriptions, endpointOwnerMap } = this.collectSubscriptions(memberSettings, memberUids);
      if (activeSubscriptions.length === 0) return;

      const payload: PushNotificationPayload = {
        title: "Setlist Updated",
        body: "The setlist has been updated",
        icon: '/icon.png',
        url,
      };

      const result = await sendNotificationToMultipleSubscriptions(activeSubscriptions, payload);
      await this.cleanupStaleSubscriptions(memberSettings, memberUids, endpointOwnerMap, result.staleEndpoints);
      return result;
    } catch (error) {
      console.error("Error sending setlist update notifications:", error);
    }
  }

  async notifyNewlyAssignedMembers(teamId: string, creatorUid: string, newMemberIds: string[], serviceDate: string, url?: string) {
    try {
      const targetMemberIds = newMemberIds.filter(uid => uid !== creatorUid);
      if (targetMemberIds.length === 0) return;

      const memberSettings = await Promise.all(
        targetMemberIds.map(uid => AccountSettingApi.getAccountSetting(uid))
      );

      const { activeSubscriptions, endpointOwnerMap } = this.collectSubscriptions(memberSettings, targetMemberIds);
      if (activeSubscriptions.length === 0) return;

      const payload: PushNotificationPayload = {
        title: "New Serving Assignment",
        body: `You have been assigned to serve on ${serviceDate}`,
        icon: '/icon.png',
        url,
      };

      const result = await sendNotificationToMultipleSubscriptions(activeSubscriptions, payload);
      await this.cleanupStaleSubscriptions(memberSettings, targetMemberIds, endpointOwnerMap, result.staleEndpoints);
      return result;
    } catch (error) {
      console.error("Error sending serving notifications:", error);
    }
  }

  /**
   * Collects active push subscriptions from member settings and builds
   * an endpoint-to-owner map for stale subscription cleanup.
   */
  private collectSubscriptions(
    memberSettings: (AccountSetting | null)[],
    memberUids: string[]
  ): { activeSubscriptions: PushSubscription[]; endpointOwnerMap: Map<string, EndpointOwner> } {
    const activeSubscriptions: PushSubscription[] = [];
    const endpointOwnerMap = new Map<string, EndpointOwner>();

    memberSettings.forEach((setting, index) => {
      if (!setting || !setting.push_notification.is_enabled) return;
      const uid = memberUids[index];

      setting.push_notification.subscriptions.forEach(sub => {
        try {
          const parsed = JSON.parse(sub.sub) as PushSubscription;
          activeSubscriptions.push(parsed);
          endpointOwnerMap.set(parsed.endpoint, { uid, deviceId: sub.device_id });
        } catch {
          // Skip malformed subscriptions
        }
      });
    });

    return { activeSubscriptions, endpointOwnerMap };
  }

  /**
   * Removes stale subscriptions (410/404 responses) from Firestore.
   */
  private async cleanupStaleSubscriptions(
    memberSettings: (AccountSetting | null)[],
    memberUids: string[],
    endpointOwnerMap: Map<string, EndpointOwner>,
    staleEndpoints: string[]
  ) {
    if (staleEndpoints.length === 0) return;

    // Group stale endpoints by user
    const staleByUser = new Map<string, Set<string>>();
    for (const endpoint of staleEndpoints) {
      const owner = endpointOwnerMap.get(endpoint);
      if (!owner) continue;
      if (!staleByUser.has(owner.uid)) {
        staleByUser.set(owner.uid, new Set());
      }
      staleByUser.get(owner.uid)!.add(owner.deviceId);
    }

    // Update each affected user's subscriptions
    const updates = Array.from(staleByUser.entries()).map(async ([uid, staleDeviceIds]) => {
      const settingIndex = memberUids.indexOf(uid);
      const setting = settingIndex >= 0 ? memberSettings[settingIndex] : null;
      if (!setting) return;

      const cleanedSubscriptions = setting.push_notification.subscriptions.filter(
        sub => !staleDeviceIds.has(sub.device_id)
      );

      try {
        await AccountSettingApi.update(uid, {
          push_notification: {
            ...setting.push_notification,
            subscriptions: cleanedSubscriptions,
            updated_time: getFirebaseTimestampNow()
          }
        });
        console.log(`Cleaned ${staleDeviceIds.size} stale subscription(s) for user ${uid}`);
      } catch (error) {
        console.error(`Failed to clean stale subscriptions for user ${uid}:`, error);
      }
    });

    await Promise.all(updates);
  }
}

export default new PushNotificationApi();
