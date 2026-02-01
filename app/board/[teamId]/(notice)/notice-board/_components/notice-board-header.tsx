"use client";

import { cn } from "@/lib/utils";
import { useRecoilState } from "recoil";
import { noticeBoardTabAtom } from "@/app/board/_states/board-states";

export type TabKey = "announcements" | "todos";

export function NoticeBoardHeaderLeft() {
  const [tab, setTab] = useRecoilState(noticeBoardTabAtom);

  const options: { key: TabKey; label: string }[] = [
    { key: "announcements", label: "Announcements" },
    { key: "todos", label: "Todos" },
  ];

  return (
    <div className="flex bg-muted/60 rounded-lg p-0.5" role="tablist" aria-label="Notice board">
      {options.map((opt) => (
        <button
          key={opt.key}
          role="tab"
          aria-selected={tab === opt.key}
          onClick={() => setTab(opt.key)}
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
}
