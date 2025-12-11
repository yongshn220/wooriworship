"use client"

import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useRecoilValueLoadable } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import tagService from "@/apis/TagService";
import { songBoardSelectedSortOptionAtom, searchSelectedTagsAtom, searchSelectedKeysAtom } from "@/app/board/_states/board-states";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SongBoardSortOption } from "@/components/constants/enums";
import { teamUniqueKeysSelector } from "@/global-states/song-state";

export function SearchFilterPopover({ children }: any) {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const [teamTags, setTeamTags] = useState<Array<string>>([])
  const [selectedTags, setSelectedTags] = useRecoilState(searchSelectedTagsAtom)
  const [selectedSortOption, setSelectedSortOption] = useRecoilState(songBoardSelectedSortOptionAtom)
  const [selectedKeys, setSelectedKeys] = useRecoilState(searchSelectedKeysAtom)
  const teamKeysLoadable = useRecoilValueLoadable(teamUniqueKeysSelector(teamId))

  useEffect(() => {
    tagService.getTeamTags(teamId).then(_teamTags => {
      setTeamTags(_teamTags.map(_tag => _tag.name))
    })
  }, [teamId])

  function isTagSelected(badge: string) {
    return selectedTags.includes(badge)
  }

  function handleTagSelect(targetTag: string) {
    if (isTagSelected(targetTag)) {
      setSelectedTags((prev: Array<string>) => ([...prev.filter((tag) => tag !== targetTag)]))
    }
    else {
      setSelectedTags((prev: Array<string>) => ([...prev, targetTag]))
    }
  }

  function isKeySelected(key: string) {
    return selectedKeys.includes(key)
  }

  function handleKeySelect(targetKey: string) {
    if (isKeySelected(targetKey)) {
      setSelectedKeys((prev: Array<string>) => ([...prev.filter((key) => key !== targetKey)]))
    }
    else {
      setSelectedKeys((prev: Array<string>) => ([...prev, targetKey]))
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="mt-2 w-[360px] p-0 overflow-hidden bg-white/80 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl ring-1 ring-gray-900/5" align="end">
        <div className="p-5 space-y-8">

          {/* Tags Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-gray-900">Tags</h4>
                <p className="text-[11px] text-gray-500 font-medium">Filter by category</p>
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-[10px] uppercase tracking-wider font-bold text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div
              className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-1 no-scrollbar overscroll-contain touch-pan-y"
              data-vaul-no-drag
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {teamTags.length > 0 ? (
                teamTags.map((tag, i) => {
                  const selected = isTagSelected(tag);
                  return (
                    <Badge
                      key={i}
                      variant={selected ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 px-3.5 py-1.5 text-xs font-semibold rounded-full border",
                        selected
                          ? "bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-lg shadow-slate-200"
                          : "bg-white hover:bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => handleTagSelect(tag)}
                    >
                      {tag}
                    </Badge>
                  )
                })
              ) : (
                <p className="text-sm text-gray-400 italic">No tags available.</p>
              )}
            </div>
          </div>

          <Separator className="bg-gray-100" />

          {/* Keys Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-gray-900">Keys</h4>
                <p className="text-[11px] text-gray-500 font-medium">Filter by musical key</p>
              </div>
              {selectedKeys.length > 0 && (
                <button
                  onClick={() => setSelectedKeys([])}
                  className="text-[10px] uppercase tracking-wider font-bold text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div
              className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1 no-scrollbar overscroll-contain touch-pan-y"
              data-vaul-no-drag
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {teamKeysLoadable.state === 'hasValue' && teamKeysLoadable.contents.length > 0 ? (
                teamKeysLoadable.contents.map((key, i) => {
                  const selected = isKeySelected(key);
                  return (
                    <Badge
                      key={key}
                      variant={selected ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 px-3 py-1.5 text-xs font-semibold rounded-full border w-10 justify-center h-8",
                        selected
                          ? "bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-lg shadow-slate-200"
                          : "bg-white hover:bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => handleKeySelect(key)}
                    >
                      {key}
                    </Badge>
                  )
                })
              ) : (
                <p className="text-sm text-gray-400 italic">No keys available.</p>
              )}
            </div>
          </div>

          <Separator className="bg-gray-100" />

          {/* Sort Section */}
          <div className="space-y-4">
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm text-gray-900">Sort By</h4>
              <p className="text-[11px] text-gray-500 font-medium">Order preference</p>
            </div>

            <div className="space-y-3">
              {/* Sort Group: Title */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-16 shrink-0">Title</span>
                <div className="flex flex-1 bg-gray-100 p-1 rounded-xl">
                  <SortButton
                    active={selectedSortOption === SongBoardSortOption.TITLE_ASCENDING}
                    onClick={() => setSelectedSortOption(SongBoardSortOption.TITLE_ASCENDING)}
                    label="A-Z"
                  />
                  <SortButton
                    active={selectedSortOption === SongBoardSortOption.TITLE_DESCENDING}
                    onClick={() => setSelectedSortOption(SongBoardSortOption.TITLE_DESCENDING)}
                    label="Z-A"
                  />
                </div>
              </div>

              {/* Sort Group: Usage */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-16 shrink-0">Usage</span>
                <div className="flex flex-1 bg-gray-100 p-1 rounded-xl">
                  <SortButton
                    active={selectedSortOption === SongBoardSortOption.LAST_USED_DATE_DESCENDING}
                    onClick={() => setSelectedSortOption(SongBoardSortOption.LAST_USED_DATE_DESCENDING)}
                    label="Newest"
                  />
                  <SortButton
                    active={selectedSortOption === SongBoardSortOption.LAST_USED_DATE_ASCENDING}
                    onClick={() => setSelectedSortOption(SongBoardSortOption.LAST_USED_DATE_ASCENDING)}
                    label="Oldest"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function SortButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
        active
          ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5"
          : "text-gray-400 hover:text-gray-600 hover:bg-gray-200/50"
      )}
    >
      {label}
    </button>
  )
}
