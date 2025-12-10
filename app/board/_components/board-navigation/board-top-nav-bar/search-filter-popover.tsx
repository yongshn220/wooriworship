"use client"

import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import tagService from "@/apis/TagService";
import { songBoardSelectedSortOptionAtom, searchSelectedTagsAtom } from "@/app/board/_states/board-states";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SongBoardSortOption } from "@/components/constants/enums";

export function SearchFilterPopover({ children }: any) {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const [teamTags, setTeamTags] = useState<Array<string>>([])
  const [selectedTags, setSelectedTags] = useRecoilState(searchSelectedTagsAtom)
  const [selectedSortOption, setSelectedSortOption] = useRecoilState(songBoardSelectedSortOptionAtom)

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

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="mt-4 w-[380px] p-0 overflow-hidden bg-white/95 backdrop-blur-md border border-gray-100 shadow-2xl rounded-xl" align="end">
        <div className="p-5 space-y-6">
          {/* Tags Section */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h4 className="font-semibold text-gray-900">Tags</h4>
              <p className="text-xs text-gray-500">Filter songs by tags</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {teamTags.length > 0 ? (
                teamTags.map((tag, i) => {
                  const selected = isTagSelected(tag);
                  return (
                    <Badge
                      key={i}
                      variant={selected ? "default" : "secondary"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 px-3 py-1 text-sm font-medium border",
                        selected
                          ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md shadow-blue-200 ring-2 ring-blue-100 ring-offset-1"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300"
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

          {/* Sort Section */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-semibold text-gray-900">Sort By</h4>
              <p className="text-xs text-gray-500">Change the order of the list</p>
            </div>

            <div className="space-y-3">
              {/* Sort Group: Title */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-600">Title</span>
                <div className="flex bg-gray-100 p-1 rounded-lg">
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
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-600">Last Used</span>
                <div className="flex bg-gray-100 p-1 rounded-lg">
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
        "px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200 shadow-sm",
        active
          ? "bg-white text-blue-600 shadow text-primary"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 shadow-none border-transparent"
      )}
    >
      {label}
    </button>
  )
}
