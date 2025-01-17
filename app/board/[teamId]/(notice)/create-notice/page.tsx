"use client"

import {FormMode} from "@/components/constants/enums";
import { NoticeForm } from "@/components/elements/design/notice/notice-form/notice-form";


export default function CreateNoticePage() {

  return (
    <div className="w-full h-full">
      <NoticeForm mode={FormMode.CREATE} noticeId={null}/>
    </div>
  )
}
