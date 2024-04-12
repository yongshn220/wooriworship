import React, {Dispatch, SetStateAction} from 'react';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import {SongInput} from "@/app/board/[teamId]/song/_components/new-button";

interface Props {
  input: SongInput
  setInput: Dispatch<SetStateAction<SongInput>>
}

export function TagMultiSelect({input, setInput}: Props) {
  const options = input.tags.map(tag => ({label: tag, value: tag}))

  function handleTagChange(options: Option[]) {
    const selectedTags = options.map(options => options.value)
    setInput((prev: SongInput) => ({...prev, tags: selectedTags}))
  }
  return (
    <div className="w-full">
      <MultipleSelector
        creatable
        defaultOptions={options}
        placeholder="Select tags you like"
        emptyIndicator={
          <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
            no results found.
          </p>
        }
        onChange={(options) => handleTagChange(options)}
        className="pl-1"
      />
    </div>
  );
}

