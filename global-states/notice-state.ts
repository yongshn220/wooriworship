import {atom, atomFamily, selectorFamily} from "recoil";
import {Notice} from "@/models/notice";


export const noticeAtom = atomFamily<Notice, string>({
  key: "noticeAtom",
  default: selectorFamily({
    key: "noticeAtom/default",
    get: (noticeId) => async ({get}) => {
      return {}
      // get(noticeUpdaterAtom)
      // try {
      //   const notice = await NoticeService.getById(noticeId) as Notice
      //   if (!notice) return null
      //
      //   return notice
      // }
      // catch (e) {
      //   console.log(e)
      //   return null
      // }
    }
  })
})

export const noticeUpdaterAtom = atom({
  key: "noticeUpdaterAtom",
  default: 0
})
