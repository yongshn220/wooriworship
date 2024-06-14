import {LayoutDashboard, LibraryBig, UsersIcon} from "lucide-react";
import {getPathPlan, getPathSong} from "@/components/helper/routes";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {Page} from "@/components/constants/enums";
import {currentPageAtom} from "@/app/board/_states/board-states";
import {CreateButton} from "@/app/board/_components/bottom-navbar/create-button";
import {ManageTeamDialog} from "@/app/board/_components/nav-bar/manage-team-dialog";
import {SettingButton} from "@/app/board/_components/bottom-navbar/setting-button";

export function BottomNavbar() {
  const currentPage = useRecoilValue(currentPageAtom)
  const currentTeamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  return (
    <div className="lg:hidden bottom-0 w-full h-[80px] bg-white shadow shadow-top">
      <div className="w-full h-full flex justify-between px-5">
        <div className={cn("w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer", {"text-black" : (currentPage === Page.PLAN)})} onClick={() => router.push(getPathPlan(currentTeamId))}>
          <LayoutDashboard/>
          <p className="text-sm">Plan</p>
        </div>
        <div className={cn("w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer", {"text-black" : (currentPage === Page.SONG)})} onClick={() => router.push(getPathSong(currentTeamId))}>
          <LibraryBig/>
          <p className="text-sm">Song</p>
        </div>
        <div className="w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer">
          <CreateButton/>
        </div>
        <ManageTeamDialog>
          <div className="w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer">
            <UsersIcon/>
            <p className="text-sm">Team</p>
          </div>
        </ManageTeamDialog>
        <div className="w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer">
          <SettingButton/>
        </div>
      </div>
    </div>
  )
}
