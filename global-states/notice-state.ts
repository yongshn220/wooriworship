import {atom, atomFamily, selectorFamily} from "recoil";
import {Notice} from "@/models/notice";
import NoticeService from "@/apis/NoticeService";


export const noticeIdsAtom = atomFamily<Array<string>, string>({
  key: "noticeIdsAtom",
  default: selectorFamily({
    key: "noticeIdsAtom/default",
    get: (teamId) => async ({get}) => {
      if (!teamId) return []
      get(noticeIdsUpdaterAtom)

      try {
        const noticeList = await NoticeService.getTeamNotices(teamId) as Array<Notice>
        if (!noticeList) return []

        noticeList.sort((a, b) => {
          try {
            const dateA = a?.created_by?.time?.toDate().getTime() || 0
            const dateB = b?.created_by?.time?.toDate().getTime() || 0
            return dateB - dateA
          }
          catch (e) {
            return 0
          }
        })

        return noticeList.map((noticeList => noticeList.id))
      }
      catch (e) {
        console.log(e)
        return []
      }
    }
  })
})

export const noticeIdsUpdaterAtom = atom({
  key: "noticeIdsUpdaterAtom",
  default: 0
})

export const noticeAtom = atomFamily<Notice, string>({
  key: "noticeAtom",
  default: selectorFamily({
    key: "noticeAtom/default",
    get: (noticeId) => async ({get}) => {
      get(noticeUpdaterAtom)
      try {
        const notice = await NoticeService.getById(noticeId) as Notice
        if (!notice) return null

        return notice
      }
      catch (e) {
        console.log(e)
        return null
      }
    }
  })
})

export const noticeUpdaterAtom = atom({
  key: "noticeUpdaterAtom",
  default: 0
})
