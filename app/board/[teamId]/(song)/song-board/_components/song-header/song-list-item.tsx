import {useRecoilValue} from "recoil";
import {songAtom} from "@/global-states/song-state";
import {getTimePassedFromTimestamp, getTimePassedFromTimestampShorten} from "@/components/helper/helper-functions";
import {Badge} from "@/components/ui/badge";
import {SongKeyBoxByText} from "@/components/song/song-key-box-by-text";

interface Props {
  songId: string
}


export function SongListItem({songId}: Props) {
  const song = useRecoilValue(songAtom(songId))
  // const musicSheetIds = useRecoilValue(musicSheetIdsAtom(song-board?.id))

  return (
    <div className="flex w-full px-4 rounded-lg cursor-pointer py-2 my-2 hover:bg-gray-100">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-md">{song?.title} <span className="text-sm text-gray-700">{song?.subtitle ? `(${song.subtitle})` : ""}</span> </p>
          {
            song?.keys?.map((songKey, index) => (
              <SongKeyBoxByText key={index} songKey={songKey}/>
            ))
          }
        </div>
        <p className="text-sm text-gray-500">{song?.original?.author ?? "unknown"}</p>
      </div>
      <div className="hidden lg:flex lg:flex-[0.4] justify-start items-center text-gray-500 text-sm pl-2">
        <div className="hidden lg:flex">{song?.version}</div>
      </div>
      <div className="hidden sm:flex flex-[1] justify-start items-center w-full text-left text-sm gap-2 pl-2">
        {
          song?.tags.map((tag, i) => (
            <Badge key={i} variant="outline" className="text-gray-500">{tag}</Badge>
          ))
        }
      </div>
      <div className="flex lg:flex-[0.5] justify-end items-center text-gray-500 text-sm pl-2">
        <div className="lg:hidden">{getTimePassedFromTimestampShorten(song?.last_used_time)}</div>
        <div className="hidden lg:flex">{getTimePassedFromTimestamp(song?.last_used_time)}</div>
      </div>
    </div>
  )
}
