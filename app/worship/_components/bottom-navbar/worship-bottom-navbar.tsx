import {DownloadIcon} from "lucide-react";
import {getPathWorshipStartMode} from "@/components/helper/routes";
import {useRouter} from "next/navigation";
import {DownloadMusicSheetDialog} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/download-music-sheet-dialog";
import {Button} from "@/components/ui/button";
import {BaseBottomNavBar} from "@/components/navigation/base-bottom-nav-bar";


interface Props {
  teamId: string
  worshipId: string
}
export function WorshipBottomNavbar({teamId, worshipId}: Props) {
  const router = useRouter()

  return (
    <BaseBottomNavBar height={80}>
      <div className="w-full h-full flex-center px-4 gap-4">
        <div className="w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer">
          <DownloadMusicSheetDialog worshipId={worshipId}>
            <div className="flex-center flex-col">
              <DownloadIcon/>
              <p className="text-xs">Save</p>
            </div>
          </DownloadMusicSheetDialog>
        </div>
        <Button className="w-full" onClick={() => router.push(getPathWorshipStartMode(teamId, worshipId))}>
          Worship View
        </Button>
      </div>
    </BaseBottomNavBar>
  )
}
