import * as React from "react";
import {useRecoilValue} from "recoil";
import {worshipMenuAtom} from "@/app/worship/[id]/_states/menu";
import {cn} from "@/lib/utils";


export function WorshipNote() {
  const menu = useRecoilValue(worshipMenuAtom)

  return (
    <div className={cn("w-full p-2 px-4 text-sm", {"hidden": !menu.note})}>
      인트로 A E F#m E 이후 어쩌구 저쩌구 후렴 4번 반복 첫번째 후렴 목소리로 이후 나머지 빌드업 어쩌구 인트로 A E F#m E 이후 어쩌구 저쩌구 후렴 4번 반복 첫번째 후렴 목소리로 이후 나머지 빌드업
    </div>
  )
}
