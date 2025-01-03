import {useEffect} from "react";
import {useSetRecoilState} from "recoil";
import {Page} from "@/components/constants/enums";
import { currentPageAtom } from "@/global-states/page-state";

interface Props {
  children: any
  pathname: string
}

export function BoardInitializer({children, pathname}: Props) {
  const setPage = useSetRecoilState(currentPageAtom)

  useEffect(() => {
    if (!pathname) {
      return;
    }
    if (/^\/board$/.test(pathname)) {
      setPage(Page.BOARD)
    }
    if (/^\/board\/[^\/]+$/.test(pathname)) {
      setPage(Page.HOME)
    }
    if (/^\/board\/[^\/]+\/notice$/.test(pathname)) {
      setPage(Page.NOTICE)
    }
    if (/^\/board\/[^\/]+\/plan$/.test(pathname)) {
      setPage(Page.PLAN)
    }
    if (/^\/board\/[^\/]+\/worship\/[^\/]+$/.test(pathname)) {
      setPage(Page.WORSHIP)
    }
    if (/^\/board\/[^\/]+\/song$/.test(pathname)) {
      setPage(Page.SONG)
    }
    if (/^\/board\/[^\/]+\/manage$/.test(pathname)) {
      setPage(Page.MANAGE)
    }

  }, [setPage, pathname])


  return (
    <>
      {children}
    </>
  )
}
