import {AccountSetting, PushNotification, Subscription} from '@/models/account-setting';
import {BaseService} from './';
import { getFirebaseTimestampNow } from '@/components/util/helper/helper-functions';

class AccountSettingService extends BaseService {
  constructor() {
    super("account_settings");
  }

  async getAccountSetting(userId: string) {
    if (!userId) {
      console.log("getAccountSetting: userId is required");
      return null;
    }
    return await this.ensureAccountSetting(userId);
  }

  private async ensureAccountSetting(uid: string): Promise<AccountSetting | null> {
    if (!uid) return null;
    
    const setting = await this.getById(uid) as AccountSetting;
    if (!setting) {
      // Create default account setting if it doesn't exist
      const defaultSetting: AccountSetting = {
        uid: uid,
        push_notification: {
          is_enabled: true,
          updated_time: getFirebaseTimestampNow(),
          subscriptions: []
        }
      };
      
      const success = await this.createWithId(uid, defaultSetting);
      return success ? {...defaultSetting, id: uid} as AccountSetting : null;
    }

    return setting;
  }
}

export default new AccountSettingService();
