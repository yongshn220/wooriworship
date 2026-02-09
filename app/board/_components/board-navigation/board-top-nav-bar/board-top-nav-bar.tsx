import { Page } from "@/components/constants/enums";
import { cn } from "@/lib/utils";
import { SearchIcon, MenuIcon, XIcon, ArrowLeftIcon, ListFilter } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { SearchInput } from "@/app/board/_components/board-navigation/board-top-nav-bar/search-input";
import { getPathCreateNotice, getPathCreatePlan, getPathCreateSong, getPathCreateServing } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { SearchPlan } from "./search-plan";
import { BaseTopNavBar } from "@/components/elements/util/navigation/base-top-nav-bar";
import { MainLogoSmall } from "@/components/elements/util/logo/main-logo";
import { currentPageAtom } from "@/global-states/page-state";
import { motion, AnimatePresence } from "framer-motion";
import { planSearchInputAtom, songSearchInputAtom } from "@/app/board/_states/board-states";
import { CreateActionButton } from "@/app/board/_components/board-navigation/create-action-button";
import { NoticeBoardHeaderLeft } from "@/app/board/[teamId]/(notice)/notice-board/_components/notice-board-header";
import { NoticeHeaderActions } from "@/app/board/_components/board-navigation/header-configs/notice-header-actions";
import { ServiceBoardHeaderLeft } from "@/app/board/[teamId]/(service)/service-board/_components/service-board-header";
import { ServiceCreationMenu } from "@/components/elements/design/service/service-creation-menu";
import { SearchFilterPopover } from "@/app/board/_components/board-navigation/board-top-nav-bar/search-filter-popover";

interface HeaderConfig {
  title?: string;
  showLogo?: boolean;
  leftContent?: React.ReactNode;
  actions?: React.ReactNode;
  searchComponent?: React.ReactNode;
}

interface ActionButtonProps {
  onClick: () => void;
  icon: any;
}

const ActionButton = ({ onClick, icon: Icon }: ActionButtonProps) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.95 }}
    className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-all"
  >
    <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
  </motion.button>
);

export function BoardTopNavBar() {
  const currentPage = useRecoilValue(currentPageAtom);
  const teamId = useRecoilValue(currentTeamIdAtom);
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const setSongSearch = useSetRecoilState(songSearchInputAtom);
  const setPlanSearch = useSetRecoilState(planSearchInputAtom);

  useEffect(() => {
    setIsSearchOpen(false);
  }, [currentPage]);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    if (currentPage === Page.SONG_BOARD) setSongSearch("");
    if (currentPage === Page.WORSHIP_BOARD) setPlanSearch("");
  };

  const config: Partial<Record<Page, HeaderConfig>> = useMemo(() => {
    const defaultConfig: HeaderConfig = {
      title: "",
      showLogo: true
    };

    return {
      [Page.NOTICE_BOARD]: {
        leftContent: <NoticeBoardHeaderLeft />,
        actions: <NoticeHeaderActions teamId={teamId} />,
      },
      [Page.SONG_BOARD]: {
        leftContent: <SearchInput />,
        actions: (
          <>
            <SearchFilterPopover>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                <ListFilter className="w-[18px] h-[18px]" strokeWidth={2} />
              </motion.button>
            </SearchFilterPopover>
            <CreateActionButton onClick={() => router.push(getPathCreateSong(teamId))} />
          </>
        ),
      },
      [Page.WORSHIP_BOARD]: {
        title: "Plans",
        actions: (
          <CreateActionButton onClick={() => router.push(getPathCreatePlan(teamId))} />
        ),
        searchComponent: <SearchPlan />
      },
      [Page.MANAGE]: {
        title: "Manage",
      },
      [Page.SERVING]: {
        leftContent: <ServiceBoardHeaderLeft />,
        actions: <ServiceCreationMenu teamId={teamId || ""} />,
      },
      [Page.BOARD]: defaultConfig,
      [Page.HOME]: defaultConfig,
      [Page.WORSHIP]: defaultConfig,
    };
  }, [teamId, router]);

  const currentConfig = config[currentPage];

  // Explicitly hidden pages logic
  if ([Page.CREATE_WORSHIP, Page.EDIT_WORSHIP, Page.CREATE_SONG, Page.EDIT_SONG, Page.CREATE_SERVING, Page.EDIT_SERVING, Page.MANAGE_SUBPAGE, Page.SETLIST_VIEW].includes(currentPage)) {
    return null;
  }

  // Fallback for undefined pages
  if (!currentConfig) return <></>;

  return (
    <BaseTopNavBar height={64} className="bg-transparent border-b md:border-none border-border z-10 transition-all duration-300 overflow-visible">
      <div className="w-full h-full max-w-7xl mx-auto px-4 md:px-8 relative flex items-center static-shell">
        <AnimatePresence mode="wait">
          {isSearchOpen && currentConfig.searchComponent ? (
            <motion.div
              key="search-mode"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full flex items-center gap-2"
            >
              <div className="flex-1">
                {currentConfig.searchComponent}
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCloseSearch}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground min-h-touch min-w-touch flex items-center justify-center"
              >
                <XIcon className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="title-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex items-center justify-between"
            >
              {/* Left Side: Custom Content, Logo, or Title */}
              <div className={cn("flex items-center gap-3", currentConfig.leftContent && "flex-1 min-w-0 mr-3")}>
                {currentConfig.leftContent ? (
                  currentConfig.leftContent
                ) : currentConfig.showLogo ? (
                  <div className="opacity-90 hover:opacity-100 transition-opacity">
                    <MainLogoSmall />
                  </div>
                ) : (
                  <h1 className="text-lg font-bold text-foreground tracking-tight">
                    {currentConfig.title}
                  </h1>
                )}
              </div>

              {/* Right Side: Actions */}
              <div className="flex items-center gap-2">
                {currentConfig.searchComponent && (
                  <ActionButton
                    onClick={() => setIsSearchOpen(true)}
                    icon={SearchIcon}
                  />
                )}
                {currentConfig.actions}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BaseTopNavBar>
  );
}
