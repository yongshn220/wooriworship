import {Separator} from "@/components/ui/separator";
import {useRecoilValue} from "recoil";
import {noticeAtom} from "@/global-states/notice-state";
import {
  timestampToDatePassedFromNowShorten,
  timestampToDateStringFormatted
} from "@/components/helper/helper-functions";
import {userAtom} from "@/global-states/userState";
import {MenuIcon, UserIcon} from "lucide-react";
import Image from 'next/image'


interface Props {
  noticeId: string
}

export function NoticeListItem({noticeId}: Props) {
  const notice = useRecoilValue(noticeAtom(noticeId))
  const user = useRecoilValue(userAtom(notice?.created_by.id))

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <p className="text-sm pl-2">{timestampToDateStringFormatted(notice?.last_updated_time)}</p>
        <p className="text-sm text-gray-500">{timestampToDatePassedFromNowShorten(notice?.last_updated_time)}</p>
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
          <div>
            <MenuIcon/>
          </div>
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
                <div key={index}>
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
