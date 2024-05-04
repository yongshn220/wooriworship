import {SongHeader} from "@/models/worship";
import {SongService} from "@/apis";
import {Song} from "@/models/song";
import LinkIcon from '@/public/icons/linkIcon.svg'
import {Button} from "@/components/ui/button";
import {SongDetailCard} from "@/app/board/[teamId]/song/_components/song-detail-card";
import {SongDetailCardWrapper} from "@/app/worship/[teamId]/[worshipId]/_components/song-detail-card-wrapper";

interface Props {
  songHeader: SongHeader
  index: number
}

export async function SongItem({songHeader, index}: Props) {
  const song = await SongService.getById(songHeader.id) as Song

  return (
    <SongDetailCardWrapper song={song}>
      <div className="flex-between w-full h-12 bg-blue-500 p-2 px-4 rounded-lg text-white cursor-pointer">
        <div className="flex-between gap-4">
          <div className="flex-center bg-white rounded-full h-7 aspect-square text-blue-500 font-bold">
            {index}
          </div>
          <div className="flex-center gap-4">
            <p className="font-semibold">{song.title}</p>
            <p className="text-sm text-gray-100">{song.original.author}</p>
          </div>
        </div>
        <div className="flex-center gap-4">
          <div>{song.key === ""? "?" : song.key} Key</div>
          <div className="cursor-pointer hover:bg-white/[0.2] rounded-full p-2">
            <LinkIcon/>
          </div>
        </div>
      </div>
    </SongDetailCardWrapper>
  )
}
