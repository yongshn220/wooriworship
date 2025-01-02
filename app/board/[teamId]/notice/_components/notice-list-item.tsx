import {Separator} from "@/components/ui/separator";
import {useRecoilValue} from "recoil";
import {noticeAtom} from "@/global-states/notice-state";
import {getTimePassedFromTimestampShorten, timestampToDateStringFormatted} from "@/components/helper/helper-functions";
import {userAtom} from "@/global-states/userState";
import {UserIcon} from "lucide-react";
import Image from 'next/image'
import {NoticeDropdownMenu} from "@/app/board/[teamId]/notice/_components/notice-dropdown-menu";
import {ImageFullScreenDialog} from "@/components/dialog/dynamic-dialog/image-full-screen/image-full-screen-dialog";
import React, {useState} from "react";


interface Props {
  noticeId: string
}

export function NoticeListItem({noticeId}: Props) {
  const [fullScreenOn, setFullScreenOn] = useState({
    state: false,
    urls: []
  })
  const notice = useRecoilValue(noticeAtom(noticeId))
  const user = useRecoilValue(userAtom(notice?.created_by.id))

  return (
    <div className="w-full">
      <ImageFullScreenDialog isOpen={fullScreenOn.state} setIsOpen={(state) => setFullScreenOn((prev) => ({...prev, state: state}))} imageUrls={fullScreenOn.urls}/>
      <div className="flex items-center gap-2">
        <p className="text-sm pl-2">{timestampToDateStringFormatted(notice?.last_updated_time)}</p>
        <p className="text-sm text-gray-500">{getTimePassedFromTimestampShorten(notice?.last_updated_time)}</p>
      </div>
      <div className="w-full p-4 border rounded-lg bg-white">
        <div className="flex items-center justify-between pb-4">
          <div className="flex-center">
            <div className="flex gap-1">
              <UserIcon/>
              <p>{user?.name}</p>
            </div>
            <div className="ml-4">
            </div>
          </div>
          <NoticeDropdownMenu noticeId={noticeId}/>
        </div>
        <Separator/>

        <div className="flex flex-col sm:flex-row">
          <div className="flex-1 p-4">
            <div className="flex-between">
              <p className="font-semibold">{notice?.title}</p>
            </div>
            <p className="py-4">{notice?.body}</p>
          </div>
          <div>
            {
              notice?.file_urls?.map((url, index) => (
                <div key={index} className="cursor-pointer" onClick={() => setFullScreenOn({state: true, urls: [url]})}>
                  <Image
                    alt="notice uploaded image"
                    src={url}
                    width={400}
                    height={400}
                  />
                </div>
              ))
            }
          </div>
        </div>

      </div>
    </div>
  )
}
