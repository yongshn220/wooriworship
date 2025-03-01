import {NoticeHeaderDefault} from "@/components/elements/design/notice/notice-header/notice-header-default";
import {useRecoilValue} from "recoil";
import {noticeIdsAtom} from "@/global-states/notice-state";
import { EmptyNoticeBoardPage } from "./empty-notice-board-page/empty-notice-board-page";

interface Props {
  teamId: string
}

export function NoticeHeaderList({teamId}: Props) {
  const noticeIdList = useRecoilValue(noticeIdsAtom(teamId))

  if (noticeIdList.length === 0) {
    return (
      <EmptyNoticeBoardPage/>
    )
  }
  
  return (
    <div className="w-full items-center">
      <div className="w-full flex-start flex-col gap-8">
        {
          noticeIdList.map((noticeId, index) => (
            <NoticeHeaderDefault key={index} noticeId={noticeId}/>
          ))
        }
      </div>
      <p className="w-full flex-center text-gray-500 text-sm py-4">end of page</p>
    </div>
  )
}
