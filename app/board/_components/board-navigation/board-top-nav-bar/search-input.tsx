'use client'

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRecoilState } from "recoil";
import { songSearchInputAtom } from "@/app/board/_states/board-states";

import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";

export function SearchInput() {
  const [globalInput, setGlobalInput] = useRecoilState(songSearchInputAtom)
  const [localInput, setLocalInput] = useState(globalInput)
  const [debouncedInput] = useDebounce(localInput, 300)

  useEffect(() => {
    setGlobalInput(debouncedInput)
  }, [debouncedInput, setGlobalInput])

  return (
    <div className="relative w-full">
      <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
      <Input
        className="w-full pl-9 pr-3 h-9 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 rounded-full placeholder:text-muted-foreground/60 text-sm transition-all"
        placeholder="Search songs..."
        value={localInput}
        onChange={(e) => setLocalInput(e.target.value)}
      />
    </div>
  )
}
