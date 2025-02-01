import {Separator} from "@/components/ui/separator";
import {useRecoilValue} from "recoil";
import {noticeAtom} from "@/global-states/notice-state";
import {getTimePassedFromTimestampShorten, timestampToDateStringFormatted} from "@/components/util/helper/helper-functions";
import {userAtom} from "@/global-states/userState";
import {UserIcon} from "lucide-react";
import Image from 'next/image'
import {NoticeHeaderMenu} from "@/components/elements/design/notice/notice-header/parts/notice-header-menu";
import React, {useState} from "react";
import {ImageFullScreenDialog} from "@/components/elements/dialog/image-full-screen/image-full-screen-dialog";
import {Linkify} from "@/components/elements/util/text/linkify";


interface Props {
  noticeId: string
}

export function NoticeHeaderDefault({noticeId}: Props) {
  const [fullScreenOn, setFullScreenOn] = useState({
    state: false,
    urls: []
  })
  const notice = useRecoilValue(noticeAtom(noticeId))
  const user = useRecoilValue(userAtom(notice?.created_by.id))

  return (
    <div className="w-full">
      <ImageFullScreenDialog isOpen={fullScreenOn.state} setIsOpen={(state: boolean) => setFullScreenOn((prev: any) => ({...prev, state: state}))} imageUrls={fullScreenOn.urls}/>
      <div className="w-full p-4 border rounded-lg bg-white relative">
        <div className="absolute top-4 right-4">
          <NoticeHeaderMenu noticeId={noticeId}/>
        </div>
        
        <div className="flex flex-col gap-4">
          {/* Time information */}
          <div className="flex items-center gap-2">
            <p className="text-sm">{timestampToDateStringFormatted(notice?.last_updated_time)}</p>
            <p className="text-sm text-gray-500">{getTimePassedFromTimestampShorten(notice?.last_updated_time)}</p>
          </div>

          {/* Title and Body */}
          <div>
            <p className="font-semibold mb-4">{notice?.title}</p>
            <div className="whitespace-pre-line break-all">
              <Linkify>
                {notice?.body || ""}
              </Linkify>
            </div>
          </div>

          {/* Images */}
          {notice?.file_urls && notice.file_urls.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {notice.file_urls.map((url, index) => (
                  <div 
                    key={index} 
                    className="cursor-pointer w-24 h-24 relative"
                    onClick={() => setFullScreenOn({state: true, urls: [url]})}>
                    <Image
                      alt="notice uploaded image"
                      src={url}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posted by */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {/* <UserIcon className="w-4 h-4"/> */}
            <span>Posted by {user?.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
