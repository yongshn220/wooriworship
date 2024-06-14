import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {songAtom} from "@/global-states/song-state";
import {useRouter} from "next/navigation";
import {getPathSongDetail} from "@/components/helper/routes";
import {timestampToDatePassedFromNow, timestampToDatePassedFromNowMini} from "@/components/helper/helper-functions";
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
      <div className="flex-[0.5] flex flex-col">
        <p className="hidden sm:flex font-semibold text-sm">{song?.title}</p>
        <p className="sm:hidden font-semibold text-md">{song?.title} {song?.key? `[${song.key}]` : ""}</p>
        <p className="text-sm text-gray-500">{song?.original.author}</p>
      </div>
      <div className="hidden sm:flex flex-[0.2] justify-center">
        <div>{song?.key === ""? "" : `${song?.key}`}</div>
      </div>
      <div className="hidden lg:flex-[0.4] flex-end items-center text-gray-500 text-sm">
        <div className="hidden lg:flex">{song?.version}</div>
      </div>
      <div className="hidden sm:flex flex-[0.7] justify-end items-center w-full text-left text-sm gap-2">
        {
          song?.tags.map((tag, i) => (
            <Badge key={i} variant="outline">{tag}</Badge>
          ))
        }
      </div>
      <div className="flex-[0.5] flex-end items-center text-gray-500 text-sm">
        <div className="sm:hidden">{timestampToDatePassedFromNowMini(song?.last_used_time)}</div>
        <div className="hidden sm:flex">{timestampToDatePassedFromNow(song?.last_used_time)}</div>
      </div>
    </div>
  )
}
