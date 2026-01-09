"use client";

import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { getPathWorshipView } from "@/components/util/helper/routes";
import { Timestamp } from "@firebase/firestore";
import { parseLocalDate } from "@/components/util/helper/helper-functions";

interface Props {
    title: string;
    date: Date | Timestamp | string;
    worshipId?: string;
    teamId: string;
}

export function ServingInfoCard({ title, date, worshipId, teamId }: Props) {
    const router = useRouter();

    const dateObj = date instanceof Timestamp ? date.toDate() : parseLocalDate(date);
    const dateStr = format(dateObj, "yyyy M d (EEE)");

    return (
        <div className="bg-muted/50 rounded-2xl p-5 relative overflow-hidden border border-border/50">
            <div className="flex flex-col gap-3 relative z-10">
                <div>
                    <h1 className="text-xl font-bold text-foreground mb-1 tracking-tight">
                        {title}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{dateStr}</span>
                    </div>
                </div>

                {worshipId && (
                    <div className="flex justify-end mt-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push(getPathWorshipView(teamId, worshipId))}
                            className="bg-background hover:bg-accent hover:text-accent-foreground text-primary text-sm font-semibold h-9 rounded-xl px-4 shadow-sm border-border transition-all active:scale-95 flex items-center gap-1"
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
