"use client"

import {useRecoilValue} from "recoil";
import {worshipAtom} from "@/global-states/worship-state";
import {teamAtom} from "@/global-states/teamState";
import {userAtom} from "@/global-states/userState";
import {BlocksIcon, CalendarIcon, MusicIcon, UserIcon, UsersIcon} from "lucide-react";
import {getDayPassedFromTimestampShorten, timestampToDateString} from "@/components/util/helper/helper-functions";
import {Separator} from "@/components/ui/separator";
import {WorshipSongHeader} from "@/models/worship";
import {MenuButton} from "@/app/board/[teamId]/(worship)/worship/[worshipId]/_components/menu-button";
import {SongDetailDialogTrigger} from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog-trigger";
import {SongListPreviewItem} from "@/app/board/[teamId]/(worship)/worship/[worshipId]/_components/song-preview-item";
import {SongCarousel} from "@/app/board/[teamId]/(worship)/worship/[worshipId]/_components/song-carousel";

export default function WorshipPage({params}: any) {
  const teamId = params.teamId
  const worshipId = params.worshipId
  const worship = useRecoilValue(worshipAtom(worshipId))
  const team = useRecoilValue(teamAtom(teamId))
  const creator = useRecoilValue(userAtom(worship?.created_by?.id))


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
        <div className="flex-start mt-2 gap-2">
          <div className="flex-start gap-2 w-40 sm:w-52">
            <UserIcon className="text-gray-500"/>
            <p className="text-gray-500">Created By</p>
          </div>
          <p>{creator?.name}</p>
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
            worship?.beginning_song?.id &&
            <div className="flex-center">
              <SongDetailDialogTrigger key={worship?.beginning_song?.id} teamId={teamId} songId={worship?.beginning_song?.id}>
                <SongListPreviewItem songId={worship?.beginning_song?.id} customTags={["beginning"]}/>
              </SongDetailDialogTrigger>
            </div>
          }
          {
            worship?.songs.map((songHeader: WorshipSongHeader) => (
              <SongDetailDialogTrigger key={songHeader?.id} teamId={teamId} songId={songHeader?.id}>
                <SongListPreviewItem songId={songHeader?.id}
                                     selectedMusicSheetIds={songHeader?.selected_music_sheet_ids}/>
              </SongDetailDialogTrigger>
            ))
          }
          {
            worship?.ending_song?.id &&
            <div className="flex-center">
              <SongDetailDialogTrigger key={worship?.ending_song?.id} teamId={teamId} songId={worship?.ending_song?.id}>
                <SongListPreviewItem songId={worship?.ending_song?.id} customTags={["ending"]}/>
              </SongDetailDialogTrigger>
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
