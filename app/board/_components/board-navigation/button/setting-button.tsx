"use client"

import {MenuIcon} from "lucide-react";
import {useSetRecoilState} from "recoil";
import {settingDialogOpenStateAtom} from "@/global-states/dialog-state";

export function SettingButton() {
  const setSettingDialogOpenState = useSetRecoilState(settingDialogOpenStateAtom)
  function handleOpenSetting() {
    setSettingDialogOpenState(true)
  }

  return (
    <div className="flex-center flex-col" onClick={handleOpenSetting}>
      <MenuIcon strokeWidth={3} className="prevent-text-select"/>
      <p className="text-sm prevent-text-select">Menu</p>
    </div>
  )
}
