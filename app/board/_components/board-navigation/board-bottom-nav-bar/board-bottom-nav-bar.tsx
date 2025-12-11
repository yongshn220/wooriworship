import { HomeIcon, Music2Icon, BellIcon, CalendarDaysIcon, LayoutGridIcon, DownloadIcon } from "lucide-react";
import { getPathHome, getPathManage, getPathNotice, getPathPlan, getPathSong, getPathWorshipView } from "@/components/util/helper/routes";
import { useRecoilValue } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Page } from "@/components/constants/enums";
import { BaseBottomNavBar } from "@/components/elements/util/navigation/base-bottom-nav-bar";
import { currentPageAtom } from "@/global-states/page-state";
import { Button } from "@/components/ui/button";
import { currentWorshipIdAtom } from "@/global-states/worship-state";
import { DownloadMusicSheetDialog } from "@/app/board/[teamId]/(worship)/worship-board/_components/download-music-sheet-dialog";
import { motion } from "framer-motion";


export function BoardBottomNavBar() {
  const currentPage = useRecoilValue(currentPageAtom)

  if (currentPage === Page.BOARD) {
    return (<></>)
  }

  if (currentPage === Page.WORSHIP) {
    return (
      <>
        <WorshipBottomNavBar />
        <DefaultBoardBottomNavBar />
      </>
    )
  }
  return (
    <DefaultBoardBottomNavBar />
  )
}


export function WorshipBottomNavBar() {
  const worshipId = useRecoilValue(currentWorshipIdAtom)
  const teamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  return (
    <BaseBottomNavBar height={80}>
      <div className="w-full h-full flex-center px-4 gap-4">
        <motion.div
          className="w-16 h-16 flex-center flex-col text-gray-500 cursor-pointer"
          whileTap={{ scale: 0.9 }}
        >
          <DownloadMusicSheetDialog worshipId={worshipId}>
            <div className="flex-center flex-col">
              <DownloadIcon />
              <p className="text-[10px] mt-1 font-medium">Save</p>
            </div>
          </DownloadMusicSheetDialog>
        </motion.div>
        <Button className="w-full shadow-lg shadow-blue-500/20" onClick={() => router.push(getPathWorshipView(teamId, worshipId))}>
          Worship View
        </Button>
      </div>
    </BaseBottomNavBar>
  )
}

export function DefaultBoardBottomNavBar() {
  const currentPage = useRecoilValue(currentPageAtom)
  const currentTeamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  const NAV_ITEMS = [
    {
      page: Page.NOTICE_BOARD,
      icon: BellIcon,
      label: "Notice",
      path: getPathNotice(currentTeamId)
    },
    {
      page: Page.WORSHIP_BOARD,
      icon: CalendarDaysIcon,
      label: "Plan",
      path: getPathPlan(currentTeamId)
    },
    {
      page: Page.SONG_BOARD,
      icon: Music2Icon,
      label: "Song",
      path: getPathSong(currentTeamId)
    },
    {
      page: Page.MANAGE,
      icon: LayoutGridIcon,
      label: "Manage",
      path: getPathManage(currentTeamId)
    },
  ]

  return (
    <BaseBottomNavBar height={80}>
      <div className="w-full h-full flex justify-between px-6 pb-2 items-center">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.page;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.label}
              className={cn(
                "w-16 h-full flex-col flex-center cursor-pointer transition-colors duration-300",
                isActive ? "text-blue-600" : "text-gray-400"
              )}
              onClick={() => router.push(item.path)}
              whileTap={{ scale: 0.9 }}
            >
              <div className="relative">
                <Icon
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn("w-6 h-6 transition-all duration-300", isActive && "fill-blue-100")}
                />
                {isActive && (
                  <motion.div
                    layoutId="active-dot"
                    className="absolute -top-2 right-0 w-1.5 h-1.5 bg-blue-600 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              <p className={cn(
                "text-[10px] mt-1 font-medium prevent-text-select transition-all duration-300",
                isActive ? "font-bold text-blue-600" : "font-medium"
              )}>
                {item.label}
              </p>
            </motion.div>
          )
        })}
      </div>
    </BaseBottomNavBar>
  )
}
