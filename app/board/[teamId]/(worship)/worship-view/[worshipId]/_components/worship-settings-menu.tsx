"use client"

import { DoorOpenIcon, SquarePenIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { getPathPlan } from "@/components/util/helper/routes";
import { Button } from "@/components/ui/button";
import { WorshipViewPageModeSelect } from "./worship-view-page-mode-select";
import { Label } from "@/components/ui/label";

interface Props {
    teamId: string,
    worshipId: string,
}

export function WorshipSettingsMenu({ teamId, worshipId }: Props) {
    const router = useRouter()

    function handleExit() {
        router.replace(getPathPlan(teamId) + `?expanded=${worshipId}`)
    }

    return (
        <div className="flex flex-col p-2 space-y-1">
            <div className="flex-between py-2 px-2 rounded-lg hover:bg-black/5 transition-colors">
                <Label className="w-full font-medium text-sm">Page Mode</Label>
                <WorshipViewPageModeSelect />
            </div>

            <Button disabled variant="ghost" className="w-full flex justify-start h-10 px-2 hover:bg-black/5 rounded-lg font-normal">
                <SquarePenIcon className="mr-3 w-4 h-4" />
                <span className="text-sm">Notating Mode</span>
            </Button>

            <Separator className="my-1 bg-black/5" />

            <Button
                variant="ghost"
                className="w-full flex justify-start h-10 px-2 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg font-normal"
                onClick={handleExit}
            >
                <DoorOpenIcon className="mr-3 w-4 h-4" />
                <span className="text-sm">Exit Worship</span>
            </Button>
        </div>
    )
}
