"use client"

import { NoticeHeaderList } from "@/app/board/[teamId]/(notice)/notice-board/_components/notice-header-list";
import { Suspense, useState, useEffect } from "react";
import { NoticeListSkeleton } from "@/app/board/[teamId]/(notice)/notice-board/_components/notice-list-skeleton";
import { TodoBoard } from "@/components/elements/design/todo";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useSetRecoilState } from "recoil";
import { headerActionsAtom, headerLeftContentAtom } from "@/app/board/_states/board-states";
import { currentPageAtom } from "@/global-states/page-state";
import { Page } from "@/components/constants/enums";
import { useRouter } from "next/navigation";
import { getPathCreateNotice } from "@/components/util/helper/routes";
import { motion } from "framer-motion";

type TabKey = "announcements" | "todos";

const CreateActionButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
  >
    <Plus className="w-5 h-5 stroke-[3px]" />
  </motion.button>
);

const NoticeBoardHeaderLeft = ({
  tab,
  onTabChange
}: {
  tab: TabKey;
  onTabChange: (tab: TabKey) => void
}) => {
  const options: { key: TabKey; label: string }[] = [
    { key: "announcements", label: "Announcements" },
    { key: "todos", label: "Todos" },
  ];

  return (
    <div className="flex bg-muted/60 rounded-lg p-0.5">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onTabChange(opt.key)}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all",
            tab === opt.key
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default function NoticePage({ params }: any) {
  const teamId = params.teamId;
  const [tab, setTab] = useState<TabKey>("announcements");
  const router = useRouter();

  const setHeaderActions = useSetRecoilState(headerActionsAtom);
  const setHeaderLeftContent = useSetRecoilState(headerLeftContentAtom);
  const setCurrentPage = useSetRecoilState(currentPageAtom);

  // Set Page ID for Navbar
  useEffect(() => {
    setCurrentPage(Page.NOTICE_BOARD);
  }, [setCurrentPage]);

  // Set Header Content
  useEffect(() => {
    setHeaderLeftContent(
      <NoticeBoardHeaderLeft
        tab={tab}
        onTabChange={setTab}
      />
    );

    // Only show create button when on Announcements tab
    setHeaderActions(
      tab === "announcements" ? (
        <CreateActionButton onClick={() => router.push(getPathCreateNotice(teamId))} />
      ) : null
    );

    return () => {
      setHeaderLeftContent(null);
      setHeaderActions(null);
    };
  }, [tab, teamId, router, setHeaderActions, setHeaderLeftContent]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Content Area */}
      <div className="flex-1 flex justify-center">
        {tab === "announcements" ? (
          <Suspense fallback={<NoticeListSkeleton />}>
            <NoticeHeaderList teamId={teamId} />
          </Suspense>
        ) : (
          <TodoBoard teamId={teamId} />
        )}
      </div>
    </div>
  );
}
