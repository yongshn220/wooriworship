"use client"

import { DoorOpenIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { getPathPlan } from "@/components/util/helper/routes";
import { Button } from "@/components/ui/button";
import { WorshipViewPageModeSelect } from "./worship-view-page-mode-select";
import { Label } from "@/components/ui/label";
import { MultipleSheetsViewSelect } from "./multiple-sheets-view-select";
import { useRecoilValue } from "recoil";
import { worshipViewPageModeAtom } from "../_states/worship-detail-states";
import { WorshipViewPageMode } from "@/components/constants/enums";
import { cn } from "@/lib/utils";

interface Props {
    teamId: string,
    worshipId: string,
}

export function WorshipSettingsMenu({ teamId, worshipId }: Props) {
    const router = useRouter()
    const pageMode = useRecoilValue(worshipViewPageModeAtom)

    function handleExit() {
        router.replace(getPathPlan(teamId) + `?expanded=${worshipId}`)
    }

    return (
        <div className="flex flex-col p-2 space-y-1">
            <div className="flex items-center justify-between gap-4 py-2 px-2 rounded-lg hover:bg-muted transition-colors">
                <Label className="font-medium text-sm text-foreground whitespace-nowrap">Page Mode</Label>
                <WorshipViewPageModeSelect />
            </div>

            <div className={cn(
                "flex items-center justify-between gap-4 py-2 px-2 rounded-lg transition-colors",
                "hover:bg-muted"
            )}>
                <Label className="font-medium text-sm text-foreground whitespace-nowrap">Direction</Label>
                <MultipleSheetsViewSelect />
            </div>

            <p className="px-2 pb-1 text-xs text-muted-foreground font-normal leading-tight">
                * Set scroll direction for songs with multiple sheets.
            </p>

            <Separator className="my-1 bg-border" />

            <Button
                variant="ghost"
                className="w-full flex justify-start h-10 px-2 hover:bg-muted text-foreground hover:text-foreground rounded-lg font-normal"
                onClick={handleExit}
            >
                <DoorOpenIcon className="mr-3 w-4 h-4" />
                <span className="text-sm">Exit Worship</span>
            </Button>
        </div>
    )
}
