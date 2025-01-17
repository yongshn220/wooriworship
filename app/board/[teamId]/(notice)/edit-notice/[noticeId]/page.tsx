"use client"

import {FormMode} from "@/components/constants/enums";
import { NoticeForm } from "@/components/elements/design/notice/notice-form/notice-form";


export default function EditNoticePage({params}: any) {
  const noticeId = params.noticeId

  return (
    <div className="w-full h-full">
      <NoticeForm mode={FormMode.EDIT} noticeId={noticeId}/>
    </div>
  )
}
