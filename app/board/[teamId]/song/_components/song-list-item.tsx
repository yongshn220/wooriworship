import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {songAtom} from "@/global-states/song-state";
import {useRouter} from "next/navigation";
import {getPathSongDetail} from "@/components/helper/routes";
import {timestampToDatePassedFromNow, timestampToDatePassedFromNowShorten} from "@/components/helper/helper-functions";
import {Badge} from "@/components/ui/badge";

interface Props {
  songId: string
}

export function SongListItem({songId}: Props) {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const song = useRecoilValue(songAtom(songId))
  const router = useRouter()

  function handleSongCardClick() {
    router.push(getPathSongDetail(teamId, song?.id))
  }

  return (
    <div className="flex w-full px-4 rounded-lg cursor-pointer py-2 my-2 hover:bg-gray-100" onClick={handleSongCardClick}>
      <div className="flex-1 flex flex-col">
        <div className="flex gap-2">
          <p className="font-semibold text-md">{song?.title}</p>
          {
            song?.key !== "" &&
            <div className="flex-center text-sm text-white font-medium bg-gray-400 rounded-sm w-5 h-5">{song.key}</div>
          }
        </div>
        <p className="text-sm text-gray-500">{song?.original.author === "" ? "unknown" : song?.original.author}</p>
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
        <div className="lg:hidden">{timestampToDatePassedFromNowShorten(song?.last_used_time)}</div>
        <div className="hidden lg:flex">{timestampToDatePassedFromNow(song?.last_used_time)}</div>
      </div>
    </div>
  )
}
