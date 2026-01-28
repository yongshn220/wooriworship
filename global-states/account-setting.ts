import AccountSettingApi from "@/apis/AccountSettingApi";
import { atomFamily, selectorFamily } from "recoil";



export const accountSettingAtom = atomFamily({
  key: "accountSettingAtom",
  default: selectorFamily({
    key: "accountSettingAtom/defulat",
    get: (userId: string) => async () => {
      const accountSetting = await AccountSettingApi.getAccountSetting(userId)
      if (!accountSetting) {
        console.error("Failed to get account setting");
        return null
      }

      return accountSetting
    }
  })
})
