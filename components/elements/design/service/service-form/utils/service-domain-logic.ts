import { ServiceFormState } from "@/models/services/ServiceEvent";

interface Member {
    id: string;
    name: string;
}

/**
 * Pure function to get suggestions based on title history.
 * Logic extracted unchanged from ServingForm.
 */
export const getSuggestionsForTitle = (
    title: string,
    historySchedules: ServiceFormState[],
    teamMembers: Member[]
): { id: string, name: string }[] => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle || historySchedules.length === 0) return [];

    const suggestions: { id: string, name: string }[] = [];
    const seen = new Set<string>();

    for (const schedule of historySchedules) {
        // Ensure items exist
        if (!schedule.items) continue;

        const matchItems = schedule.items.filter(i => i.title.trim() === normalizedTitle && (i as any).type !== 'WORSHIP_TEAM');

        for (const item of matchItems) {
            if (!item.assignments) continue;
            for (const assignment of item.assignments) {
                for (const uid of assignment.memberIds) {
                    if (seen.has(uid)) continue;

                    // Check if it's a known member or group
                    const member = teamMembers.find(m => m.id === uid);
                    if (member) {
                        seen.add(uid);
                        suggestions.push({ id: uid, name: member.name });
                    } else if (uid.startsWith("group:")) {
                        seen.add(uid);
                        suggestions.push({ id: uid, name: uid });
                    }

                    if (suggestions.length >= 3) return suggestions;
                }
            }
        }
        if (suggestions.length >= 3) break;
    }
    return suggestions;
};
