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
    <Popover modal={true}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0 overflow-hidden bg-white/95 backdrop-blur-3xl border-white/20 shadow-2xl rounded-3xl ring-1 ring-black/5" align="end" sideOffset={8}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 bg-gradient-to-b from-white to-transparent z-10 relative">
          <h3 className="font-bold text-lg text-slate-900 tracking-tight">Refine</h3>
          {(selectedTags.length > 0 || selectedKeys.length > 0) && (
            <button
              onClick={() => { setSelectedTags([]); setSelectedKeys([]); }}
              className="text-xs font-bold text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div
          className="max-h-[60vh] overflow-y-auto overscroll-contain px-5 pb-5 space-y-6 no-scrollbar touch-pan-y"
          data-vaul-no-drag
          onWheel={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* Tags Section */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {teamTags.length > 0 ? (
                teamTags.map((tag, i) => {
                  const selected = isTagSelected(tag);
                  return (
                    <Badge
                      key={i}
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-all duration-200 px-3 py-1.5 text-xs font-semibold rounded-xl border-2",
                        selected
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-transparent text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
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
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Musical Key</h4>
            <div className="flex flex-wrap gap-2">
              {teamKeysLoadable.state === 'hasValue' && teamKeysLoadable.contents.length > 0 ? (
                teamKeysLoadable.contents.map((key) => {
                  const selected = isKeySelected(key);
                  return (
                    <Badge
                      key={key}
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-all duration-200 px-3 py-1.5 text-xs font-bold rounded-xl border-2 min-w-[2.5rem] justify-center h-9",
                        selected
                          ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-200"
                          : "bg-transparent text-gray-600 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
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
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sort Order</h4>

            <div className="grid gap-3">
              {/* Title Group */}
              <div className="bg-gray-100/80 p-1 rounded-2xl flex gap-1">
                <SortSegment
                  active={selectedSortOption === SongBoardSortOption.TITLE_ASCENDING}
                  onClick={() => setSelectedSortOption(SongBoardSortOption.TITLE_ASCENDING)}
                  label="Title (A-Z)"
                />
                <SortSegment
                  active={selectedSortOption === SongBoardSortOption.TITLE_DESCENDING}
                  onClick={() => setSelectedSortOption(SongBoardSortOption.TITLE_DESCENDING)}
                  label="Title (Z-A)"
                />
              </div>

              {/* Date Group */}
              <div className="bg-gray-100/80 p-1 rounded-2xl flex gap-1">
                <SortSegment
                  active={selectedSortOption === SongBoardSortOption.LAST_USED_DATE_DESCENDING}
                  onClick={() => setSelectedSortOption(SongBoardSortOption.LAST_USED_DATE_DESCENDING)}
                  label="Newest First"
                />
                <SortSegment
                  active={selectedSortOption === SongBoardSortOption.LAST_USED_DATE_ASCENDING}
                  onClick={() => setSelectedSortOption(SongBoardSortOption.LAST_USED_DATE_ASCENDING)}
                  label="Oldest First"
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function SortSegment({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200",
        active
          ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5 scale-[1.02]"
          : "text-gray-400 hover:text-gray-600 hover:bg-black/5"
      )}
    >
      {label}
    </button>
  )
}
