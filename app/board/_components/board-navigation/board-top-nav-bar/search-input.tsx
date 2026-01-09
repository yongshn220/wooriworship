'use client'

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRecoilState } from "recoil";
import { songSearchInputAtom } from "@/app/board/_states/board-states";
import { SearchFilterPopover } from "@/app/board/_components/board-navigation/board-top-nav-bar/search-filter-popover";
import { Button } from "@/components/ui/button";

import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";

export function SearchInput() {
  const [globalInput, setGlobalInput] = useRecoilState(songSearchInputAtom)
  const [localInput, setLocalInput] = useState(globalInput)
  const [debouncedInput] = useDebounce(localInput, 300)

  useEffect(() => {
    setGlobalInput(debouncedInput)
  }, [debouncedInput, setGlobalInput])

  // Sync local input if global changes externally (optional but good for consistency)
  useEffect(() => {
    if (globalInput !== debouncedInput) {
      setLocalInput(globalInput)
    }
  }, [globalInput, debouncedInput])

  return (
    <div className="relative w-full">
      <Search className="absolute top-1/2 left-3.5 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
      <Input
        className="w-full pl-10 pr-12 h-11 bg-muted/50 border-0 ring-1 ring-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 rounded-full shadow-sm placeholder:text-muted-foreground text-base sm:text-sm transition-all hover:bg-background hover:ring-foreground/20 hover:shadow-md focus:bg-background"
        placeholder="Search songs..."
        value={localInput}
        onChange={(e) => setLocalInput(e.target.value)}
      />
      <div className="absolute right-1.5 top-1/2 transform -translate-y-1/2">
        <SearchFilterPopover>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors text-xs font-medium"
          >
            <span>Filter</span>
            <SlidersHorizontal size={12} />
          </Button>
        </SearchFilterPopover>
      </div>
    </div>
  )
}
