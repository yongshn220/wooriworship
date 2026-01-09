"use client";

import { Calendar, ArrowRight, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { getPathWorshipView } from "@/components/util/helper/routes";
import { Timestamp } from "@firebase/firestore";
import { parseLocalDate } from "@/components/util/helper/helper-functions";
import { ServingHeaderMenu } from "../serving-header-menu";

interface Props {
    scheduleId: string;
    title: string;
    date: Date | Timestamp | string;
    worshipId?: string;
    teamId: string;
    onPreview?: (worshipId: string) => void;
}

export function ServingInfoCard({ scheduleId, title, date, worshipId, teamId, onPreview }: Props) {
    const router = useRouter();

    const dateObj = date instanceof Timestamp ? date.toDate() : (date instanceof Date ? date : parseLocalDate(date));
    const dateStr = format(dateObj, "yyyy M d (EEE)");

    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 relative overflow-hidden border border-blue-100 dark:border-blue-800/50">
            <div className="flex flex-col gap-4 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-foreground mb-1 tracking-tight pr-8">
                            {title}
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground font-medium">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{dateStr}</span>
                        </div>
                    </div>

                    <ServingHeaderMenu
                        scheduleId={scheduleId}
                        teamId={teamId}
                        iconType="vertical"
                        scheduleTitle={title}
                        scheduleDate={format(dateObj, "yyyy/MM/dd")}
                        trigger={
                            <button className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-2 -mt-2">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        }
                    />
                </div>

                {worshipId && (
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                if (onPreview) {
                                    onPreview(worshipId);
                                } else {
                                    router.push(getPathWorshipView(teamId, worshipId));
                                }
                            }}
                            className="bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold h-9 rounded-xl px-4 shadow-sm border border-transparent transition-all active:scale-95 flex items-center gap-1.5"
                        >
                            worship plan
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
