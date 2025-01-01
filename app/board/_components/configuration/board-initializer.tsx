import {useEffect} from "react";
import {useSetRecoilState} from "recoil";
import {Page} from "@/components/constants/enums";
import { currentPageAtom } from "@/components/states/page-states";

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
    if (/^\/board\/[^\/]+\/song$/.test(pathname)) {
      setPage(Page.SONG)
    }
  }, [setPage, pathname])


  return (
    <>
      {children}
    </>
  )
}
