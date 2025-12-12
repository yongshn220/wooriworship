import { TeamIcon } from "@/components/elements/design/team/team-icon"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface Props {
    name?: string
    description?: string
    teamCount?: number
    onSwitchClick?: () => void
}

export function TeamProfileCard({ name, description, teamCount, onSwitchClick }: Props) {
    return (
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center mb-6">
            <div className="mb-4 transform scale-125">
                <TeamIcon name={name} />
            </div>

            <h2 className="text-lg font-bold text-foreground mb-1">
                {name || "Unnamed Team"}
            </h2>

            <div className="text-sm text-muted-foreground mb-4">
                Current Workspace
            </div>

            {onSwitchClick && (
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full h-8 px-4 text-xs font-medium"
                    onClick={onSwitchClick}
                >
                    Switch Team
                    <ChevronRight className="w-3 h-3 ml-1 opacity-50" />
                </Button>
            )}
        </div>
    )
}
