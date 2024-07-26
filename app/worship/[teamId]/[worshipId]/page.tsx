"use client"

import {SongCarousel} from "@/app/worship/[teamId]/[worshipId]/_components/song-carousel";
import {SongHeader} from "@/models/worship";
import CalendarIcon from '@/public/icons/calendarIcon.svg'
import {Separator} from "@/components/ui/separator";
import {MenuButton} from "@/app/worship/[teamId]/[worshipId]/_components/menu-button";
import UsersIcon from '@/public/icons/usersIcon.svg'
import {useRecoilValue} from "recoil";
import {teamAtom} from "@/global-states/teamState";
import {
  getDayPassedFromTimestampShorten,
  timestampToDateString
} from "@/components/helper/helper-functions";
import {worshipAtom} from "@/global-states/worship-state";
import {ViewMode} from "@/app/board/[teamId]/song/_components/song-list-item";
import {SongDetailCardWrapper} from "@/app/worship/[teamId]/[worshipId]/_components/song-detail-card-wrapper";
import * as React from "react";
import {BlocksIcon, MusicIcon} from "lucide-react";
import {SongListPreviewItem} from "@/app/worship/[teamId]/[worshipId]/_components/song-preview-item";


export default function WorshipPage({params}: any) {
  const teamId = params.teamId
  const worshipId = params.worshipId
  const worship = useRecoilValue(worshipAtom(worshipId))
  const team = useRecoilValue(teamAtom(teamId))


  return (
    <div className="w-full flex-center">
      <div className="flex-start flex-col w-full px-0 sm:px-6 gap-2 max-w-4xl">
        <div className="flex-between w-full">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold">{worship?.title}</p>
          <MenuButton teamId={teamId} title={worship?.title} worshipId={worshipId}/>
        </div>
        <div className="flex-start mt-6 gap-2">
          <div className="flex-start gap-2 w-40 sm:w-52">
            <UsersIcon className="text-gray-500"/>
            <p className="text-gray-500">Team</p>
          </div>
          <p>{team?.name}</p>
        </div>
        <div className="flex items-center mt-2 gap-2">
          <div className="flex-start gap-2 w-40 sm:w-52">
            <CalendarIcon className="text-gray-500"/>
            <p className="text-gray-500">Worship Date</p>
          </div>
          <p>{timestampToDateString(worship?.worship_date)}</p>
          <p className="text-xs text-gray-500 h-full">{getDayPassedFromTimestampShorten(worship?.worship_date)}</p>
        </div>
        <p className="mt-10">
          {worship?.description}
        </p>
        <div className="w-full flex-start flex-col my-2 mt-10">
          <div className="flex items-center gap-2">
            <MusicIcon className="w-4 h-4"/>
            <p className="font-semibold">Song List</p>
          </div>
          <Separator/>
        </div>
        <div className="flex flex-col w-full gap-4">
          {
            worship?.beginning_song_id &&
            <div className="flex-center">
              <SongDetailCardWrapper key={worship?.beginning_song_id} teamId={teamId} songId={worship?.beginning_song_id}>
                <SongListPreviewItem songId={worship?.beginning_song_id} customTags={["beginning"]}/>
              </SongDetailCardWrapper>
            </div>
          }
          {
            worship?.songs.map((songHeader: SongHeader, index: number) => (
              <SongDetailCardWrapper key={songHeader?.id} teamId={teamId} songId={songHeader?.id}>
                <SongListPreviewItem songId={songHeader?.id} viewMode={ViewMode.NONE} />
              </SongDetailCardWrapper>
            ))
          }
          {
            worship?.ending_song_id &&
            <div className="flex-center">
              <SongDetailCardWrapper key={worship?.ending_song_id} teamId={teamId} songId={worship?.ending_song_id}>
                <SongListPreviewItem songId={worship?.ending_song_id} customTags={["ending"]}/>
              </SongDetailCardWrapper>
            </div>
          }
        </div>
        <div className="w-full flex-start flex-col my-2 mt-10">
          <div className="flex items-center gap-2">
            <BlocksIcon className="w-4 h-4"/>
            <p className="font-semibold">Music Sheets</p>
          </div>
          <Separator/>
        </div>
        <div className="w-full flex-center flex-col">
          <SongCarousel worship={worship}/>
        </div>
      </div>
    </div>
  )
}
