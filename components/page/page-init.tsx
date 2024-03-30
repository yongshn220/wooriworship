'use client'

import {useSetRecoilState} from "recoil";
import {currentPageAtom} from "@/app/board/_states/pageState";
import {useEffect} from "react";
import {Routes} from "@/components/constants/enums";

interface Props {
  route: Routes
}

export function PageInit({route}: Props) {
  const setCurrentPage = useSetRecoilState(currentPageAtom)

  useEffect(() => {
    setCurrentPage(route as Routes)
  }, [route, setCurrentPage])

  return(<></>)
}
