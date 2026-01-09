"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ServingHeaderMenu } from "./serving-header-menu";

interface Props {
    onAdd: () => void;
    scheduleId?: string;
    teamId?: string;
}

export function ServingBoardHeader({ onAdd, scheduleId, teamId }: Props) {
    return (
        <header className="sticky top-0 z-50 bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-border-light dark:border-border-dark transition-colors duration-200">
            <div className="px-4 py-3 flex justify-between items-center max-w-lg mx-auto">
                <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">Serving Schedule</h1>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={onAdd}
                        className="bg-primary hover:bg-blue-600 text-white rounded-full p-1.5 w-8 h-8 shadow-md active:scale-95 transition-all"
                    >
                        <Plus className="h-5 w-5" />
                    </Button>

                    {scheduleId && teamId && (
                        <div className="flex items-center justify-center w-8 h-8">
                            <ServingHeaderMenu scheduleId={scheduleId} teamId={teamId} />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
