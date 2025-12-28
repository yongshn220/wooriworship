import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getPathCreateServing } from "@/components/util/helper/routes";
import { useRecoilValue } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";

export function EmptyServingBoardPage() {
    const teamId = useRecoilValue(currentTeamIdAtom);

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <Image
                alt="Empty serving plan"
                src="/illustration/empty-serving-plan-v3.png"
                width={300}
                height={300}
                className="mb-2"
                priority
            />
            <div className="space-y-2 max-w-sm">
                <h3 className="text-2xl font-bold tracking-tight text-foreground">Serving Plan is empty</h3>
                <p className="text-muted-foreground text-sm">
                    Click &ldquo;Add Schedule&rdquo; button to get started and organize your serving teams.
                </p>
            </div>
            <div className="pt-2">
                <Link href={getPathCreateServing(teamId)}>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Schedule
                    </Button>
                </Link>
            </div>
        </div>
    )
}
