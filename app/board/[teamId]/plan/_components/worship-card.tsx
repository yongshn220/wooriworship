"use client"

import {HoverOverlay} from "@/components/hover-overlay";
import Link from "next/link";
import {Worship} from "@/models/worship";
import {SongService} from "@/apis";
import {timestampToDateString} from "@/components/helper/helper-functions";
import {getPathWorship} from "@/components/helper/routes";
import {useEffect, useState} from "react";
import {useRecoilValue, useRecoilValueLoadable} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {worshipAtom, worshipSongListAtom} from "@/global-states/worship-state";

interface Props {
  worshipId: string
}

export function WorshipCard({worshipId}: Props) {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const worship = useRecoilValue(worshipAtom(worshipId))
  const worshipSongListLoadable = useRecoilValueLoadable(worshipSongListAtom(worshipId))

  return (
    <div>
      <Link href={getPathWorship(teamId, worship.id)}>
        <div className="group aspect-[1/1] border rounded-lg flex flex-col overflow-hidden bg-[#95ABCC] cursor-pointer">
          <div className="relative flex-1 flex-center flex-col text-white text-xs font-semibold gap-2 p-2">
            <HoverOverlay/>
            { worshipSongListLoadable.state === 'loading' && <></> }
            { worshipSongListLoadable.state === 'hasError' && <></> }
            {
              worshipSongListLoadable.state === 'hasValue' &&
              worshipSongListLoadable.contents.map((song, i) => (
                <p key={i} className="line-clamp-1">{song?.title}</p>
              ))
            }
          </div>
          <p className="p-4 bg-white text-xs line-clamp-1">
            {worship?.title}
          </p>
        </div>
      </Link>
      <p className="w-full text-center text-sm text-gray-600 mt-1">
        {timestampToDateString(worship?.worship_date)} <span className="text-xs">(Mon)</span>
      </p>
    </div>
  )
}
