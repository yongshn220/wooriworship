'use client'
import {HoverOverlay} from "@/components/hover-overlay";
import LinkIcon from '@/public/icons/linkIcon.svg'
import HeartIcon from '@/public/icons/heartIcon.svg'
import {Badge} from "@/components/ui/badge";
import {useRouter} from "next/navigation";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {songAtom} from "@/global-states/song-state";
import {OpenYoutubeLink} from "@/components/helper/helper-functions";
import {toast} from "@/components/ui/use-toast";


interface Props {
  songId: string
}
export function SongGridItem({songId}: Props) {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const song = useRecoilValue(songAtom(songId))
  const router = useRouter()

  function handleSongCardClick() {
    router.push(`/board/${teamId}/song/${song.id}`)
  }

  function handleLinkButtonClick() {
    if (song?.original?.url) {
      OpenYoutubeLink(song.original.url)
    }
  }

  function handleLikeButtonClick() {
    toast({title: "Like button will be updated soon."})
  }

  return (
    <div className="h-full">
      <div className="aspect-[5/4] border rounded-lg flex flex-col overflow-hidden bg-[#95ABCC]">
        <div className="relative group h-full flex-center flex-col text-white cursor-pointer"
             onClick={handleSongCardClick}>
          <HoverOverlay/>
          <p className="font-semibold text-sm">{song?.title} {song?.key !== ""? `[${song.key}]` : ""}</p>
          <p className="text-xs">{song?.original.author}</p>
        </div>
        <div className="flex-between bg-white p-2">
          <div className="cursor-pointer hover:bg-gray-100 rounded-full p-2" onClick={handleLikeButtonClick}>
            <HeartIcon/>
          </div>
          <div className="cursor-pointer hover:bg-gray-100 rounded-full p-2" onClick={handleLinkButtonClick}>
            <LinkIcon/>
          </div>
        </div>
      </div>
      <div className="w-full text-left text-sm mt-1 space-x-2 space-y-2">
        {
          song?.tags.map((tag,i) => (
            <Badge key={i} variant="outline">{tag}</Badge>
          ))
        }
      </div>
    </div>
  )
}
