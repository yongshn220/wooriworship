import {DownloadIcon, LayoutDashboard, LibraryBig, UsersIcon} from "lucide-react";
import {getPathPlan, getPathSong} from "@/components/helper/routes";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {Page} from "@/components/constants/enums";
import {currentPageAtom} from "@/app/board/_states/board-states";
import {ManageTeamDialog} from "@/app/board/_components/nav-bar/manage-team-dialog";
import {SettingButton} from "@/app/board/_components/bottom-navbar/setting-button";
import {StartButton} from "@/app/worship/_components/bottom-navbar/start-button";
import {
  DownloadMusicSheetDialog
} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/download-music-sheet-dialog";


interface Props {
  teamId: string
  worshipId: string
}
export function BottomNavbar({teamId, worshipId}: Props) {
  const currentPage = useRecoilValue(currentPageAtom)
  const currentTeamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  return (
    <div className="bottom-0 w-full h-[80px] bg-white shadow shadow-top">
      <div className="w-full h-full flex justify-between px-5">
        <div className={cn("w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer", {"text-black": (currentPage === Page.PLAN)})}
          onClick={() => router.push(getPathPlan(currentTeamId))}>
          <LayoutDashboard/>
          <p className="text-sm">Plan</p>
        </div>
        <div
          className={cn("w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer", {"text-black": (currentPage === Page.SONG)})}
          onClick={() => router.push(getPathSong(currentTeamId))}>
          <LibraryBig/>
          <p className="text-sm">Song</p>
        </div>
        <div className="w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer">
          <StartButton teamId={teamId} worshipId={worshipId}/>
        </div>
        <div className="w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer">
          <DownloadMusicSheetDialog worshipId={worshipId}>
            <div className="flex-center flex-col">
              <DownloadIcon/>
              <p className="text-sm">Download</p>
            </div>
          </DownloadMusicSheetDialog>
        </div>
        <div className="w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer">
          <SettingButton/>
        </div>
      </div>
    </div>
  )
}
