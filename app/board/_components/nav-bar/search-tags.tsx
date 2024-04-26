"use client"

import {Badge} from "@/components/ui/badge";
import FilterIcon from '@/public/icons/filterIcon.svg'
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {useEffect, useState} from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import tagService from "@/apis/TagService";
import {searchSelectedTagsAtom} from "@/app/board/_states/pageState";

export function SearchTags() {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const [teamTags, setTeamTags] = useState<Array<string>>([])
  const [selectedTags, setSelectedTags] = useRecoilState(searchSelectedTagsAtom)

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
        <FilterIcon/>
      </PopoverTrigger>
      <PopoverContent className="mt-4 w-[350px]">
          <p className="font-semibold">Tags</p>
          <p className="text-sm text-gray-500">Select tags you like to search the songs</p>
          <div className="relative w-full space-x-2 space-y-2 mt-2">
            {
              teamTags.map((tag, i) => (
                <Badge
                  key={i}
                  className={cn("bg-[#AA95CC] hover:bg-[#9780BE] cursor-pointer", {"bg-[#7357A1] hover:bg-[#7357A1]": isTagSelected(tag)})}
                  onClick={() => handleTagSelect(tag)}
                >
                  {tag}
                </Badge>
              ))
            }
          </div>
      </PopoverContent>
    </Popover>
  )
}
