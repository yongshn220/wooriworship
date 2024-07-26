import {NoticeListItem} from "@/app/board/[teamId]/notice/_components/notice-list-item";
import {useRecoilValue} from "recoil";
import {noticeIdsAtom} from "@/global-states/notice-state";

interface Props {
  teamId: string
}

export function NoticeList({teamId}: Props) {
  const noticeIdList = useRecoilValue(noticeIdsAtom(teamId))

  return (
    <div className="w-full items-center">
      <div className="w-full flex-start flex-col gap-8">
        {
          noticeIdList.map((noticeId, index) => (
            <NoticeListItem key={index} noticeId={noticeId}/>
          ))
        }
      </div>
      <p className="w-full flex-center text-gray-500 text-sm py-4">end of page</p>
    </div>
  )
}
