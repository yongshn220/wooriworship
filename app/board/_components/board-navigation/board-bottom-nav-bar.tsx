import {HomeIcon, FileMusicIcon, CircleCheckIcon, CalendarIcon, CircleUserRoundIcon} from "lucide-react";
import {getPathHome, getPathManage, getPathNotice, getPathPlan, getPathSong} from "@/components/helper/routes";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {Page} from "@/components/constants/enums";
import { BaseBottomNavBar } from "@/components/navigation/base-bottom-nav-bar";
import { currentPageAtom } from "@/global-states/page-state";

export function BoardBottomNavBar() {
  const currentPage = useRecoilValue(currentPageAtom)
  const currentTeamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  return (
    <BaseBottomNavBar height={80}>
      <div className="w-full h-full flex justify-between px-5">
        <div
          className={cn("w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer", {"text-blue-500": (currentPage === Page.HOME)})}
          onClick={() => router.push(getPathHome(currentTeamId))}>
          <HomeIcon strokeWidth={2}/>
          <p className="text-xs prevent-text-select">Home</p>
        </div>
        <div
          className={cn("w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer", {"text-blue-500": (currentPage === Page.NOTICE)})}
          onClick={() => router.push(getPathNotice(currentTeamId))}>
          <CircleCheckIcon strokeWidth={2}/>
          <p className="text-xs prevent-text-select">Notice</p>
        </div>
        <div
          className={cn("w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer", {"text-blue-500": (currentPage === Page.PLAN)})}
          onClick={() => router.push(getPathPlan(currentTeamId))}>
          <CalendarIcon strokeWidth={2}/>
          <p className="text-xs prevent-text-select">Plan</p>
        </div>
        <div
          className={cn("w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer", {"text-blue-500": (currentPage === Page.SONG)})}
          onClick={() => router.push(getPathSong(currentTeamId))}>
          <FileMusicIcon strokeWidth={2}/>
          <p className="text-xs prevent-text-select">Song</p>
        </div>
        <div
          className={cn("w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer", {"text-blue-500": (currentPage === Page.MANAGE)})}
          onClick={() => router.push(getPathManage(currentTeamId))}>
          <CircleUserRoundIcon strokeWidth={2} className="prevent-text-select"/>
          <p className="text-sm prevent-text-select">Manage</p>
        </div>
      </div>
    </BaseBottomNavBar>
  )
}
