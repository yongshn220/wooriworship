'use client'

import { useRecoilState } from "recoil";
import { songSearchInputAtom } from "@/app/board/_states/board-states";
import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";
import { SearchBar } from "@/components/common/search-bar";

interface Props {
  onFocus?: () => void
  onBlur?: () => void
}

export function SearchInput({ onFocus, onBlur }: Props) {
  const [globalInput, setGlobalInput] = useRecoilState(songSearchInputAtom)
  const [localInput, setLocalInput] = useState(globalInput)
  const [debouncedInput] = useDebounce(localInput, 300)

  useEffect(() => {
    setGlobalInput(debouncedInput)
  }, [debouncedInput, setGlobalInput])

  return (
    <SearchBar
      value={localInput}
      onChange={setLocalInput}
      placeholder="Search songs..."
      onFocus={onFocus}
      onBlur={onBlur}
      size="sm"
    />
  )
}
