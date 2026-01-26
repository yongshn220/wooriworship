"use client"

import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import { useRecoilValue } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import tagService from "@/apis/TagService";
import { toast } from "@/components/ui/use-toast";
import { SongInput } from "@/components/elements/design/song/song-form/song-form";

interface Props {
  input: SongInput
  setInput: Dispatch<SetStateAction<SongInput>>
}

export function TagMultiSelect({ input, setInput }: Props) {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const [teamTags, setTeamTags] = useState<Array<string>>([])
  const teamOptions = useMemo(() => (teamTags.map(tag => ({ label: tag, value: tag }))), [teamTags])
  const selectedOptions = useMemo(() => (input.tags.map(tag => ({ label: tag, value: tag }))), [input.tags])

  useEffect(() => {
    tagService.getTeamTags(teamId).then(_teamTags => {
      setTeamTags(_teamTags.map((_tag: any) => _tag.name))
    })
  }, [teamId])

  function handleTagChange(options: Option[]) {
    const selectedTags = options.map(options => options.value)
    setInput((prev: SongInput) => ({ ...prev, tags: selectedTags }))
  }

  return (
    <div className="w-full">
      <MultipleSelector
        creatable
        options={teamOptions}
        value={selectedOptions}
        maxSelected={5}
        onMaxSelected={(maxLimit) => {
          toast({
            title: `You have reached max selected: ${maxLimit}`,
          });
        }}
        placeholder="Select tags you like"
        emptyIndicator={
          <p className="text-center text-lg leading-10 text-muted-foreground">
            no results found.
          </p>
        }
        onChange={(options) => handleTagChange(options)}
        className="pl-1 bg-background"
      />
    </div>
  );
}
