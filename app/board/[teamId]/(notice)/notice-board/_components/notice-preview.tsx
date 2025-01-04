import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {getPathNotice} from "@/components/helper/routes";
import {NoticePreviewItem} from "@/app/board/[teamId]/(notice)/notice-board/_components/notice-preview-item";
import {useRecoilValue} from "recoil";
import {noticeIdsAtom} from "@/global-states/notice-state";


interface Props {
  teamId: string
}

export function NoticePreview({teamId}: Props) {
  const router = useRouter()
  const noticeIds = useRecoilValue(noticeIdsAtom(teamId))

  return (
    <div className="p-4 rounded-xl">
      <p className="text-xl font-semibold pb-4">Recent Notice</p>
      <div className="space-y-2">
        {
          noticeIds.slice(0, 1).map((noticeId, index) => (
            <NoticePreviewItem key={index} teamId={teamId} noticeId={noticeId}/>
          ))
        }
      </div>
      <div className="w-full flex-center">
        <Button variant="ghost" className="text-blue-500 hover:text-blue-600 hover:bg-none" onClick={() => router.push(getPathNotice(teamId))}>View All</Button>
      </div>
    </div>
  )
}
