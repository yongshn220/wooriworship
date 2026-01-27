"use client"

import * as React from "react"
import { ArrowUpDown } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { useRecoilState, useSetRecoilState } from "recoil";
import { WorshipSpecialOrderType } from "@/components/constants/enums";
import { WorshipSongHeader } from "@/models/worship";
import { selectedWorshipSongHeaderListAtom, worshipBeginningSongHeaderAtom, worshipEndingSongHeaderAtom } from "@/global-states/worship-creation-state";

interface Props {
  songHeader: WorshipSongHeader
  songOrder: number
}

type OrderValue = WorshipSpecialOrderType | string

export function SwapOrderButton({ songHeader, songOrder }: Props) {
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
        <div className="flex-center w-10 h-10 bg-white hover:bg-gray-100 text-blue-600 rounded-full font-bold text-sm border border-gray-200 shadow-sm transition-all active:scale-95 group">
          <span className="group-hover:hidden">{songOrder}</span>
          <ArrowUpDown className="hidden group-hover:block w-4 h-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex-center flex-col">
        <DropdownMenuLabel className="border-b">Change Order</DropdownMenuLabel>
        <DropdownMenuSeparator />
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
