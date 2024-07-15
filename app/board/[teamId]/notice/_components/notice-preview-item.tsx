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
import {useRouter} from "next/navigation";
import {getPathNotice} from "@/components/helper/routes";


interface Props {
  teamId: string
  noticeId: string
}

export function NoticePreviewItem({teamId, noticeId}: Props) {
  const notice = useRecoilValue(noticeAtom(noticeId))
  const router = useRouter()

  return (
    <div className="w-full rounded-lg p-2 cursor-pointer hover:bg-gray-50" onClick={() => router.push(getPathNotice(teamId))}>
      <div className="flex items-center gap-2">
        <p className="text-sm pl-2">{timestampToDateStringFormatted(notice?.last_updated_time)}</p>
        <p className="text-sm text-gray-500">{timestampToDatePassedFromNowShorten(notice?.last_updated_time)}</p>
      </div>
      <Separator/>
      <div className="w-full">
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
                    width={100}
                    height={100}
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
