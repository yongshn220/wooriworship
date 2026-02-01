import { Page } from "@/components/constants/enums";
import { cn } from "@/lib/utils";
import { SearchIcon, MenuIcon, XIcon, ArrowLeftIcon, SlidersHorizontal } from "lucide-react";
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
  label?: string;
  variant?: 'default' | 'ghost';
}

const ActionButton = ({ onClick, icon: Icon, label, variant = 'default' }: ActionButtonProps) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={cn(
      "group relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 min-h-touch",
      variant === 'default'
        ? "bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
        : "hover:bg-muted text-muted-foreground hover:text-foreground"
    )}
  >
    <Icon className="w-6 h-6 stroke-[2px]" />
    {label && <span className="text-sm font-semibold">{label}</span>}
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
        title: "Song Board",
        actions: (
          <>
            <SearchFilterPopover>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 min-h-touch hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <SlidersHorizontal className="w-5 h-5 stroke-[2px]" />
              </motion.button>
            </SearchFilterPopover>
            <CreateActionButton onClick={() => router.push(getPathCreateSong(teamId))} />
          </>
        ),
        searchComponent: <SearchInput />
      },
      [Page.WORSHIP_BOARD]: {
        title: "Worship Plan",
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
  if ([Page.CREATE_WORSHIP, Page.EDIT_WORSHIP, Page.CREATE_SONG, Page.EDIT_SONG, Page.CREATE_SERVING, Page.EDIT_SERVING, Page.MANAGE_SUBPAGE].includes(currentPage)) {
    return null;
  }

  // Fallback for undefined pages
  if (!currentConfig) return <></>;

  return (
    <BaseTopNavBar height={64} className="bg-background/80 backdrop-blur-xl border-b border-border shadow-sm z-50 supports-[backdrop-filter]:bg-background/60 transition-all duration-300 overflow-hidden">
      <div className="w-full h-full max-w-7xl mx-auto px-4 relative flex items-center static-shell">
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
              <div className="flex items-center gap-3">
                {currentConfig.leftContent ? (
                  currentConfig.leftContent
                ) : currentConfig.showLogo ? (
                  <div className="opacity-90 hover:opacity-100 transition-opacity">
                    <MainLogoSmall />
                  </div>
                ) : (
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">
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
                    variant="ghost"
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
