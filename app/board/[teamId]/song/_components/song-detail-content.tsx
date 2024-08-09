import {Label} from "@/components/ui/label";
import {SongKeyBox} from "@/components/song/song-key-box";
import {Button} from "@/components/ui/button";
import {LinkIcon} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {getTimePassedFromTimestamp, OpenYoutubeLink} from "@/components/helper/helper-functions";
import React, {useEffect, useMemo, useState} from "react";
import {useRecoilValue} from "recoil";
import {songAtom} from "@/global-states/song-state";
import {SongDetailMusicSheetArea} from "@/app/board/[teamId]/song/_components/song-detail-music-sheet-area";
import {musicSheetAtom, musicSheetIdsAtom} from "@/global-states/music-sheet-state";


interface Props {
  songId: string
}

export function SongDetailContent({songId}: Props) {
  const song = useRecoilValue(songAtom(songId))
  const musicSheetIds = useRecoilValue(musicSheetIdsAtom(song?.id))
  const [selectedMusicSheetId, setSelectedMusicSheetId] = useState<string>(null)

  useEffect(() => {
    setSelectedMusicSheetId(musicSheetIds? musicSheetIds[0] : null)
  }, [musicSheetIds])


  function handleLinkButtonClick() {
    if (song?.original?.url) {
      OpenYoutubeLink(song?.original.url)
    }
  }

  return (
    <div className="grid gap-6 w-full mt-10">
      {
        song?.version &&
        <div className="flex-between items-center">
          <Label htmlFor="name" className="text-base font-semibold">
            Version
          </Label>
          <p>{song?.version}</p>
        </div>
      }
      <div className="flex-between items-center">
        <Label htmlFor="name" className="text-base font-semibold">
          Key
        </Label>
        <div className="flex gap-2">
          {
            musicSheetIds?.map((musicSheetId, index) => (
              <SongKeyBox key={index} musicSheetId={musicSheetId}/>
            ))
          }
        </div>
      </div>
      <div className="flex-between items-center">
        <Label htmlFor="name" className="text-base font-semibold">
          Link
        </Label>
        <Button variant="ghost" className="text-blue-500 hover:text-blue-600 cursor-pointer gap-2 p-0"
                onClick={handleLinkButtonClick}>
          <LinkIcon className="w-4 h-4"/>
          <p>Go to the Link</p>
        </Button>
      </div>
      <div className="flex-between items-center">
        <Label htmlFor="name" className="text-base font-semibold">
          Tags
        </Label>
        <div className="w-full text-right space-x-2 pl-20">
          {
            song?.tags.map((tag, i) => (
              <Badge key={i} variant="outline">{tag}</Badge>
            ))
          }
        </div>
      </div>
      {
        song?.bpm &&
        <div className="flex-between items-center">
          <Label htmlFor="name" className="text-base font-semibold">
            BPM
          </Label>
          <p>
            {song?.bpm}
          </p>
        </div>
      }
      <div className="flex-between items-center">
        <Label htmlFor="name" className="text-base font-semibold">
          Used on
        </Label>
        <p className="text-sm">{getTimePassedFromTimestamp(song?.last_used_time)}</p>
      </div>
      {
        song?.description &&
        <div className="flex-start flex-col items-center gap-1.5 p-4 bg-gray-100 rounded-lg">
          <div className="whitespace-pre-wrap">
            {song?.description}
          </div>
        </div>
      }
      <div className="space-y-1">
        <div className="relative flex flex-col gap-4 bg-gray-100 p-4 rounded-md">
        {/*<Label htmlFor="name" className="text-base font-semibold text-white flex-center">*/}
        {/*  Music Sheets*/}
        {/*</Label>*/}
          <div className="flex-center gap-2">
            <div className="flex-center gap-2">
              {
                musicSheetIds.map((musicSheetId, index) => (
                  <MusicSheetKey key={index} musicSheetId={musicSheetId} selectedMusicSheetId={selectedMusicSheetId} setSelectedMusicSheetId={setSelectedMusicSheetId}/>
                ))
              }
            </div>
          </div>
          <div className="flex-center">
            <SongDetailMusicSheetArea musicSheetId={selectedMusicSheetId} />
          </div>
        </div>
      </div>
    </div>
  )
}


interface MusicSheetKeyProps {
  musicSheetId: string
  selectedMusicSheetId: string
  setSelectedMusicSheetId: React.Dispatch<React.SetStateAction<string>>
}

function MusicSheetKey({musicSheetId, selectedMusicSheetId, setSelectedMusicSheetId}: MusicSheetKeyProps) {
  const musicSheet = useRecoilValue(musicSheetAtom(musicSheetId))

  return (
    <Badge
      variant={(selectedMusicSheetId === musicSheetId) ? "default" : "outline"}
      className="cursor-pointer w-8 h-8 flex-center border-black"
      onClick={() => setSelectedMusicSheetId(musicSheetId)}
    >
      {musicSheet?.key}
    </Badge>
  )
}
