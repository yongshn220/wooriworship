"use client"

import {Badge} from "@/components/ui/badge";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {useEffect, useState} from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import tagService from "@/apis/TagService";
import {songBoardSelectedSortOptionAtom, searchSelectedTagsAtom} from "@/app/board/_states/board-states";
import {Button} from "@/components/ui/button";
import {Settings2Icon} from "lucide-react";
import {Separator} from "@/components/ui/separator";
import {SongBoardSortOption} from "@/components/constants/enums";

export function SearchTags() {
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
      <PopoverTrigger>
        <Button variant="outline" className="gap-2">
          <Settings2Icon/>
          <p>Modify Result</p>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mt-4 w-[400px] space-y-8">
        <div className="w-full">
          <p className="font-semibold">Tags</p>
          <p className="text-sm text-gray-500">Select tags to filter the songs</p>
          <div className="relative w-full space-x-2 space-y-2 mt-2">
            {
              teamTags.map((tag, i) => (
                <Badge
                  key={i}
                  className={cn("bg-[#BEB3CF] hover:bg-[#9780BE] cursor-pointer", {"bg-[#7357A1] hover:bg-[#7357A1]": isTagSelected(tag)})}
                  onClick={() => handleTagSelect(tag)}
                >
                  {tag}
                </Badge>
              ))
            }
          </div>
        </div>
        <Separator/>
        <div>
          <p className="font-semibold">Sort</p>
          <p className="text-sm text-gray-500">Select option to sort the list</p>
          <div className="w-full mt-4">
            <div className="flex-between">
              <p className="text-sm font-semibold text-gray-500">Title</p>
              <div className="flex">
                <Button variant={selectedSortOption === SongBoardSortOption.TITLE_ASCENDING? "secondary" : "ghost"} className="w-full" onClick={() => setSelectedSortOption(SongBoardSortOption.TITLE_ASCENDING)}>Ascending</Button>
                <Button variant={selectedSortOption === SongBoardSortOption.TITLE_DESCENDING? "secondary" : "ghost"}  className="w-full" onClick={() => setSelectedSortOption(SongBoardSortOption.TITLE_DESCENDING)}>Descending</Button>
              </div>
            </div>
            <div className="flex-between">
              <p className="text-sm font-semibold text-gray-500">Last Used</p>
              <div className="flex">
                <Button variant={selectedSortOption === SongBoardSortOption.LAST_USED_DATE_ASCENDING? "secondary" : "ghost"}  className="w-full" onClick={() => setSelectedSortOption(SongBoardSortOption.LAST_USED_DATE_ASCENDING)}>Ascending</Button>
                <Button variant={selectedSortOption === SongBoardSortOption.LAST_USED_DATE_DESCENDING? "secondary" : "ghost"}  className="w-full" onClick={() => setSelectedSortOption(SongBoardSortOption.LAST_USED_DATE_DESCENDING)}>Descending</Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
