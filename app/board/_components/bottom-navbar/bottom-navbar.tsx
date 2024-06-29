import {HomeIcon, Columns2Icon, UsersIcon} from "lucide-react";
import {getPathManageTeam, getPathPlan, getPathSong} from "@/components/helper/routes";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {Page} from "@/components/constants/enums";
import {currentPageAtom} from "@/app/board/_states/board-states";
import {CreateButton} from "@/app/board/_components/bottom-navbar/create-button";
import {SettingButton} from "@/app/board/_components/bottom-navbar/setting-button";

export function BottomNavbar() {
  const currentPage = useRecoilValue(currentPageAtom)
  const currentTeamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  return (
    <div className="lg:hidden bottom-0 w-full h-[80px] bg-white shadow shadow-top">
      <div className="w-full h-full flex justify-between px-5">
        <div className={cn("w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer", {"text-black" : (currentPage === Page.PLAN)})} onClick={() => router.push(getPathPlan(currentTeamId))}>
          <HomeIcon strokeWidth={3}/>
          <p className="text-sm prevent-text-select">Plan</p>
        </div>
        <div className={cn("w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer", {"text-black" : (currentPage === Page.SONG)})} onClick={() => router.push(getPathSong(currentTeamId))}>
          <Columns2Icon strokeWidth={3}/>
          <p className="text-sm prevent-text-select">Song</p>
        </div>
        <div className="w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer">
          <CreateButton/>
        </div>
        <div className={cn("w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer", {"text-black" : (currentPage === Page.MANAGE_TEAM)})} onClick={() => router.push(getPathManageTeam(currentTeamId))}>
          <UsersIcon strokeWidth={3}/>
          <p className="text-sm prevent-text-select">Team</p>
        </div>
        <div className="w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer">
          <SettingButton/>
        </div>
      </div>
    </div>
  )
}
