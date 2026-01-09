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

    const dateObj = date instanceof Timestamp ? date.toDate() : parseLocalDate(date);
    const dateStr = format(dateObj, "yyyy M d (EEE)");

    // ... (rendering code)

    {
        worshipId && (
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
        )
    }
            </div >
        </div >
    );
}
