"use client"

import * as React from "react"

import {DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import {useRecoilState, useSetRecoilState} from "recoil";
import {selectedWorshipSongWrapperListAtom, worshipBeginningSongWrapperAtom, worshipEndingSongWrapperAtom} from "@/app/board/[teamId]/plan/_components/status";
import {WorshipSpecialOrderType} from "@/components/constants/enums";
import {WorshipSongWrapper} from "@/components/constants/types";

interface Props {
  songWrapper: WorshipSongWrapper
  songOrder: number
}

type OrderValue = WorshipSpecialOrderType | string

export function SwapOrderButton({songWrapper, songOrder}: Props) {
  const [selectedSongInfoList, setSelectedSongInfoList] = useRecoilState(selectedWorshipSongWrapperListAtom)
  const setBeginningSongWrapper = useSetRecoilState(worshipBeginningSongWrapperAtom)
  const setEndingSongWrapper = useSetRecoilState(worshipEndingSongWrapperAtom)

  function handleClick(value: OrderValue) {
    if (value === WorshipSpecialOrderType.BEGINNING) {
      handleSetBeginningSong(); return;
    }
    if (value === WorshipSpecialOrderType.ENDING) {
      handleSetEndingSong(); return;
    }

    handleOrderChange(value)
  }

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

  function handleSetBeginningSong() {
    setSelectedSongInfoList((prev) => ([...prev.filter(info => info?.song?.id !== songWrapper?.song?.id)]))
    setBeginningSongWrapper({
      id: songWrapper?.song?.id,
      key: songWrapper?.selectedKeys[0]
    })
  }

  function handleSetEndingSong() {
    setSelectedSongInfoList((prev) => ([...prev.filter(info => info?.song?.id !== songWrapper?.song?.id)]))
    setEndingSongWrapper({
      id: songWrapper?.song?.id,
      key: songWrapper?.selectedKeys[0]
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex-center w-10 h-10 bg-blue-300 hover:bg-blue-500 text-white rounded-full font-semibold text-sm border-4 border-white shadow-lg">
          {songOrder}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex-center flex-col">
        <DropdownMenuLabel className="border-b">Change Order</DropdownMenuLabel>
        <DropdownMenuSeparator/>
        <DropdownMenuRadioGroup value={songOrder.toString()} onValueChange={handleClick} className="w-full">
          <DropdownMenuRadioItem className="w-full cursor-pointer" value={WorshipSpecialOrderType.BEGINNING}>Beginning</DropdownMenuRadioItem>
          {
            selectedSongInfoList.map((_, i) => (
              <DropdownMenuRadioItem key={i + 1} value={(i + 1).toString()} className="w-full cursor-pointer">{i + 1}</DropdownMenuRadioItem>
            ))
          }
          <DropdownMenuRadioItem className="w-full cursor-pointer" value={WorshipSpecialOrderType.ENDING}>Ending</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
