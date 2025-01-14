"use client"

import {useRecoilValue} from "recoil";
import {worshipAtom} from "@/global-states/worship-state";
import {teamAtom} from "@/global-states/teamState";
import {userAtom} from "@/global-states/userState";
import {
  BlocksIcon,
  CalendarIcon,
  LinkIcon,
  MusicIcon,
  UserIcon,
  UsersIcon,
  Copy,
  Check,
  FileTextIcon
} from "lucide-react";
import {getDayPassedFromTimestampShorten, timestampToDateString} from "@/components/util/helper/helper-functions";
import {Separator} from "@/components/ui/separator";
import {WorshipSongHeader} from "@/models/worship";
import {MenuButton} from "@/app/board/[teamId]/(worship)/worship/[worshipId]/_components/menu-button";
import {SongDetailDialogTrigger} from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog-trigger";
import {WorshipSongHeaderDefault} from "@/components/elements/design/song/song-header/worshp/worship-song-header-default";
import {SongCarousel} from "@/app/board/[teamId]/(worship)/worship/[worshipId]/_components/song-carousel";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {toast} from "@/components/ui/use-toast";
import {Linkify} from "@/components/elements/util/text/linkify";

export default function WorshipPage({params}: any) {
  const teamId = params.teamId
  const worshipId = params.worshipId
  const worship = useRecoilValue(worshipAtom(worshipId))
  const team = useRecoilValue(teamAtom(teamId))
  const creator = useRecoilValue(userAtom(worship?.created_by?.id))
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(worship?.link)
      setCopied(true)
      toast({description: "Copied to clipboard!"})
      setTimeout(() => setCopied(false), 2000)
    }
    catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const truncateLink = (url: string) => {
    if (url.length > 40) {
      return url.substring(0, 37) + '...'
    }
    return url
  }

  return (
    <div className="w-full flex-center">
      <div className="w-full flex-start flex-col gap-2 p-4">

        <div className="flex-between w-full">
          <p className="text-2xl font-bold md:text-3xl">{worship?.title}</p>
          <MenuButton teamId={teamId} title={worship?.title} worshipId={worshipId}/>
        </div>

        <div className="w-full my-6 space-y-6 rounded-lg">
          <div className="flex items-center gap-4">
            <UsersIcon className="w-6 h-6 text-muted-foreground"/>
            <div>
              <div className="text-sm text-muted-foreground">Team</div>
              <div className="font-medium">{team?.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <UserIcon className="w-6 h-6 text-muted-foreground"/>
            <div>
              <div className="text-sm text-muted-foreground">Created By</div>
              <div className="font-medium">{creator?.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <CalendarIcon className="w-6 h-6 text-muted-foreground"/>
            <div>
              <div className="text-sm text-muted-foreground">Worship Date</div>
              <div className="flex font-medium gap-2">
                <p>{timestampToDateString(worship?.worship_date)}</p>
                <Badge variant="secondary" className="rounded-full bg-gray-200">{getDayPassedFromTimestampShorten(worship?.worship_date)}</Badge>
              </div>
            </div>
          </div>

          <>
            {
              worship?.link &&
              <div className="w-full flex items-center gap-4 pr-3">
                <LinkIcon className="shrink-0 w-6 h-6 text-muted-foreground"/>
                <div className="w-full">
                  <div className="text-sm text-muted-foreground">Link</div>
                  <div className="w-full flex items-center gap-2">
                    <a
                      href={worship?.link}
                      className="w-full font-medium text-primary hover:underline truncate"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {worship?.link}
                    </a>
                    <Button variant="ghost" size="sm" onClick={copyToClipboard} className="ml-2">
                      { copied ? <Check className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4"/> }
                    </Button>
                  </div>
                </div>
              </div>
            }
          </>
          <>
            {
              worship?.description &&
              <div className="w-full flex items-start gap-4">
                <FileTextIcon className="h-6 w-6 text-muted-foreground shrink-0 mt-1"/>
                <div className="w-full space-y-1">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <div className="w-full rounded-lg border mt-2 p-4">
                    <Linkify>
                      <div className="w-full break-all">
                        {worship?.description}
                      </div>
                    </Linkify>
                  </div>
                </div>
              </div>
            }
          </>
        </div>


        <Separator/>
        <div className="w-full flex-start flex-col my-2">
          <div className="flex items-center gap-2">
            <MusicIcon className="h-6 w-6 text-muted-foreground"/>
            <h3 className="font-semibold">Song List</h3>
          </div>

        </div>
        <div className="flex flex-col w-full gap-4">
          {
          worship?.beginning_song?.id &&
            <div className="flex-center">
              <SongDetailDialogTrigger key={worship?.beginning_song?.id} teamId={teamId}
                                       songId={worship?.beginning_song?.id}>
                <WorshipSongHeaderDefault songId={worship?.beginning_song?.id} customTags={["beginning"]}/>
              </SongDetailDialogTrigger>
            </div>
          }
          {
            worship?.songs.map((songHeader: WorshipSongHeader) => (
              <SongDetailDialogTrigger key={songHeader?.id} teamId={teamId} songId={songHeader?.id}>
                <WorshipSongHeaderDefault songId={songHeader?.id}
                                          selectedMusicSheetIds={songHeader?.selected_music_sheet_ids}/>
              </SongDetailDialogTrigger>
            ))
          }
          {
            worship?.ending_song?.id &&
            <div className="flex-center">
              <SongDetailDialogTrigger key={worship?.ending_song?.id} teamId={teamId} songId={worship?.ending_song?.id}>
                <WorshipSongHeaderDefault songId={worship?.ending_song?.id} customTags={["ending"]}/>
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
