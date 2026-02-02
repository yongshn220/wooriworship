"use client";

import { cn } from "@/lib/utils";
import { useRecoilState } from "recoil";
import { noticeBoardTabAtom } from "@/app/board/_states/board-states";

export type TabKey = "announcements" | "todos";

export function NoticeBoardHeaderLeft() {
  const [tab, setTab] = useRecoilState(noticeBoardTabAtom);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "announcements", label: "Notice" },
    { key: "todos", label: "Todos" },
  ];

  return (
    <div className="flex bg-muted rounded-full p-1 gap-0.5" role="tablist" aria-label="Notice board">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={tab === t.key}
          onClick={() => setTab(t.key)}
          className={cn(
            "px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all",
            tab === t.key
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
