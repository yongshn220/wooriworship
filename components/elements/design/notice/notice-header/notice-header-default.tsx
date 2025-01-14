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
import ReactLinkify from "react-linkify";
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
      <ImageFullScreenDialog isOpen={fullScreenOn.state} setIsOpen={(state: boolean) => setFullScreenOn((prev) => ({...prev, state: state}))} imageUrls={fullScreenOn.urls}/>
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
          <NoticeHeaderMenu noticeId={noticeId}/>
        </div>
        <Separator/>

        <div className="flex flex-col sm:flex-row">
          <div className="flex-1 p-4">
            <div className="flex-between">
              <p className="font-semibold">{notice?.title}</p>
            </div>
            <div className="py-4">
              <div className="py-4 whitespace-pre-line">
                <Linkify>
                  {notice?.body || ""}
                </Linkify>
              </div>
            </div>
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
