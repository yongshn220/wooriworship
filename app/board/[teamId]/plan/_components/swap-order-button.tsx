"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {useRecoilState} from "recoil";
import {selectedSongInfoListAtom} from "@/app/board/[teamId]/plan/_components/status";

interface Props {
  songId: string
  songOrder: number
}
export function SwapOrderButton({songId, songOrder}: Props) {
  const [selectedSongInfoList, setSelectedSongInfoList] = useRecoilState(selectedSongInfoListAtom)

  function handleOrderChange(newOrderString: string) {
    try {
      const newOrder = Number(newOrderString)
      const _selectedSongInfoList = [...selectedSongInfoList]
      const removed = _selectedSongInfoList.splice((songOrder - 1), 1)[0];
      _selectedSongInfoList.splice((newOrder - 1), 0, removed);
      setSelectedSongInfoList(_selectedSongInfoList)
    }
    catch (e) {
      console.log(e, "handleOrderChange")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex-center w-10 h-10 bg-blue-300 hover:bg-blue-500 text-white rounded-full font-semibold text-sm border-4 border-white shadow-lg">
          {songOrder}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="">
        <DropdownMenuLabel>Change Order</DropdownMenuLabel>
        <DropdownMenuSeparator/>
        <DropdownMenuRadioGroup value={songOrder.toString()} onValueChange={handleOrderChange}>
          {
            selectedSongInfoList.map((_, i) => (
              <DropdownMenuRadioItem key={i + 1} value={(i + 1).toString()}>{i + 1}</DropdownMenuRadioItem>
            ))
          }
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
