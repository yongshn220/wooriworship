import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getPathNotice } from "@/components/util/helper/routes";
import { NoticeHeaderMinimal } from "@/components/elements/design/notice/notice-header/notice-header-minimal";
import { useRecoilValue } from "recoil";
import { noticeIdsAtom } from "@/global-states/notice-state";


interface Props {
  teamId: string
}

export function NoticeBoardPreview({ teamId }: Props) {
  const router = useRouter()
  const noticeIds = useRecoilValue(noticeIdsAtom(teamId))

  return (
    <div className="p-4 rounded-xl">
      <p className="text-xl font-semibold pb-4">Recent Notice</p>
      <div className="space-y-2">
        {
          noticeIds.slice(0, 1).map((noticeId, index) => (
            <NoticeHeaderMinimal key={index} teamId={teamId} noticeId={noticeId} />
          ))
        }
      </div>
      <div className="w-full flex-center">
        <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => router.push(getPathNotice(teamId))}>View All</Button>
      </div>
    </div>
  )
}
