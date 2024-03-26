import {Badge} from "@/components/ui/badge";
import FilterIcon from '@/public/icons/filterIcon.svg'
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {useState} from "react";

const tags = ["빠른", "잔잔한", "사랑", "기쁨", "신나는", "엔딩곡", "시작곡"]

export function SearchTags() {
  const [selectedTags, setSelectedTags] = useState<Array<string>>([])

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
              tags.map((tag, i) => (
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
