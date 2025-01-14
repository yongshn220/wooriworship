"use client"

import * as React from "react"

import {DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import {useRecoilState, useSetRecoilState} from "recoil";
import {WorshipSpecialOrderType} from "@/components/constants/enums";
import {WorshipSongHeader} from "@/models/worship";
import {selectedWorshipSongHeaderListAtom, worshipBeginningSongHeaderAtom, worshipEndingSongHeaderAtom} from "@/app/board/[teamId]/(worship)/worship-board/_components/status";

interface Props {
  songHeader: WorshipSongHeader
  songOrder: number
}

type OrderValue = WorshipSpecialOrderType | string

export function SwapOrderButton({songHeader, songOrder}: Props) {
  const [selectedSongHeaderList, setSelectedSongHeaderList] = useRecoilState(selectedWorshipSongHeaderListAtom)
  const setBeginningSongHeader = useSetRecoilState(worshipBeginningSongHeaderAtom)
  const setEndingSongHeader = useSetRecoilState(worshipEndingSongHeaderAtom)

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
      const _selectedSongHeaderList = [...selectedSongHeaderList]
      const removed = _selectedSongHeaderList.splice((songOrder - 1), 1)[0];
      _selectedSongHeaderList.splice((newOrder - 1), 0, removed);
      setSelectedSongHeaderList(_selectedSongHeaderList)
    }
    catch (e) {
      console.log(e, "handleOrderChange")
    }
  }

  function handleSetBeginningSong() {
    setSelectedSongHeaderList((prev) => ([...prev.filter(header => header?.id !== songHeader?.id)]))
    setBeginningSongHeader({
      id: songHeader?.id,
      note: songHeader?.note,
      selected_music_sheet_ids: songHeader?.selected_music_sheet_ids
    })
  }

  function handleSetEndingSong() {
    setSelectedSongHeaderList((prev) => ([...prev.filter(header => header?.id !== songHeader?.id)]))
    setEndingSongHeader({
      id: songHeader?.id,
      note: songHeader?.note,
      selected_music_sheet_ids: songHeader?.selected_music_sheet_ids
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
            selectedSongHeaderList.map((_, i) => (
              <DropdownMenuRadioItem key={i + 1} value={(i + 1).toString()} className="w-full cursor-pointer">{i + 1}</DropdownMenuRadioItem>
            ))
          }
          <DropdownMenuRadioItem className="w-full cursor-pointer" value={WorshipSpecialOrderType.ENDING}>Ending</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
