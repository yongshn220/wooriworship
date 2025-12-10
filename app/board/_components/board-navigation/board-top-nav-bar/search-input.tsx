'use client'

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRecoilState } from "recoil";
import { songSearchInputAtom } from "@/app/board/_states/board-states";

export function SearchInput() {
  const [input, setInput] = useRecoilState(songSearchInputAtom)

  return (
    <div className="relative w-full max-w-md transition-all duration-300">
      <Search className="absolute top-1/2 left-3.5 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
      <Input
        className="w-full pl-10 pr-4 h-11 bg-white border-0 ring-1 ring-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 rounded-full shadow-sm placeholder:text-gray-400 text-sm transition-shadow hover:ring-gray-300 hover:shadow-md"
        placeholder="Search by title, lyrics, or author..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  )
}
