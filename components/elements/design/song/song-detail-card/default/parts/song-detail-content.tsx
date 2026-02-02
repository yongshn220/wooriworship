import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getTimePassedFromTimestamp, OpenYoutubeLink } from "@/components/util/helper/helper-functions";
import React from "react";
import { useRecoilValue } from "recoil";
import { songAtom } from "@/global-states/song-state";


interface Props {
  teamId: string
  songId: string
}

export function SongDetailContent({ teamId, songId }: Props) {
  const song = useRecoilValue(songAtom({ teamId, songId }))

  function handleLinkButtonClick() {
    if (song?.original?.url) {
      OpenYoutubeLink(song?.original.url)
    }
  }

  return (
    <div className="grid gap-6 w-full">
      {/* Link Section */}
      {song?.original?.url && (
        <div className="flex justify-between items-center">
          <Label htmlFor="name" className="text-base font-semibold">
            Link
          </Label>
          <Button variant="ghost" className="text-primary hover:text-primary/80 cursor-pointer gap-2 p-0 h-auto"
            onClick={handleLinkButtonClick}>
            <LinkIcon className="w-4 h-4" />
            <p>Go to the Link</p>
          </Button>
        </div>
      )}

      {/* Tags Section */}
      <div className="flex justify-between items-center">
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

      {/* Last Used Section */}
      <div className="flex justify-between items-center">
        <Label htmlFor="name" className="text-base font-semibold">
          Used on
        </Label>
        <div className="text-right">
          {song?.last_used_time && (
            <p className="text-sm">{new Date(song.last_used_time.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          )}
          <p className="text-xs text-muted-foreground">{getTimePassedFromTimestamp(song?.last_used_time)}</p>
        </div>
      </div>

      {/* Description Section */}
      {
        song?.description &&
        <div className="flex flex-col items-start gap-1.5 p-4 bg-muted rounded-lg">
          <div className="whitespace-pre-wrap text-sm text-muted-foreground">
            {song?.description}
          </div>
        </div>
      }
    </div>
  )
}
