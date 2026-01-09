import { useState } from "react";
import { generateWorshipTitle } from "@/components/util/helper/helper-functions";
import { WorshipPlanPreviewDrawer } from "../worship/worship-plan-preview-drawer";

// ... imports

export function ServingDetailView({ schedule, roles, members, currentUserUid, teamId }: Props) {
    const team = useRecoilValue(teamAtom(teamId));
    const [previewWorshipId, setPreviewWorshipId] = useState<string | null>(null);

    // ... existing consts

    return (
        <div className="space-y-5 pb-24">
            {/* Info Card Component */}
            <ServingInfoCard
                scheduleId={schedule.id}
                title={displayTitle}
                date={schedule.date}
                worshipId={schedule.worship_id}
                teamId={teamId}
                onPreview={setPreviewWorshipId}
            />

            {/* ... existing sections ... */}

            {/* Empty State / Fallback */}
            {!hasWorshipRoles && !hasItems && (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 opacity-50">
                    <p className="text-sm text-slate-500">No details available for this schedule.</p>
                </div>
            )}

            {/* Preview Drawer */}
            <WorshipPlanPreviewDrawer
                isOpen={!!previewWorshipId}
                onClose={() => setPreviewWorshipId(null)}
                worshipId={previewWorshipId}
            />
        </div>
    );
}
