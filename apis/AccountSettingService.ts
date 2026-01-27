import { AccountSetting } from '@/models/account-setting';
import BaseService from './BaseService';
import { getFirebaseTimestampNow } from '@/components/util/helper/helper-functions';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

class AccountSettingService { // Removed BaseService inheritance as path is dynamic

  async getAccountSetting(userId: string): Promise<AccountSetting | null> {
    if (!userId) {
      console.error("getAccountSetting: userId is required");
      return null;
    }
    return await this.ensureAccountSetting(userId);
  }

  async update(userId: string, data: Partial<AccountSetting>) {
    if (!userId) return false;
    const ref = doc(db, `users/${userId}/config/account_setting`);
    await updateDoc(ref, data);
    return true;
  }

  private async ensureAccountSetting(uid: string): Promise<AccountSetting | null> {
    if (!uid) return null;

    const ref = doc(db, `users/${uid}/config/account_setting`);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // Create default account setting if it doesn't exist
      const defaultSetting: AccountSetting = {
        uid: uid,
        push_notification: {
          is_enabled: true,
          updated_time: getFirebaseTimestampNow(),
          subscriptions: []
        }
      };

      await setDoc(ref, defaultSetting);
      return { ...defaultSetting, id: 'account_setting' } as AccountSetting; // id is not strictly used but for compatibility
    }

    return snap.data() as AccountSetting;
  }
}

export default new AccountSettingService();
