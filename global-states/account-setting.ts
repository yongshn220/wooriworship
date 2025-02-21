import AccountSettingService from "@/apis/AccountSettingService";
import { atomFamily, selectorFamily } from "recoil";



export const accountSettingAtom = atomFamily({
  key: "accountSettingAtom",
  default: selectorFamily({
    key: "accountSettingAtom/defulat",
    get: (userId: string) => async () => {
      const accountSetting = await AccountSettingService.getAccountSetting(userId)
      if (!accountSetting) {
        console.log("Failed to get account setting");
        return null
      }

      return accountSetting
    }
  })
})
