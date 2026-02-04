import { ServiceAssignment, ServiceFlowItem } from "@/models/services/ServiceEvent";

/**
 * Computes newly added member IDs by comparing old vs new praise team assignments.
 * Returns only members that are in newAssignments but not in oldAssignments.
 */
export function getNewlyAddedMemberIds(
  oldAssignments: ServiceAssignment[] | undefined,
  newAssignments: ServiceAssignment[]
): string[] {
  const oldIds = new Set((oldAssignments || []).flatMap(a => a.memberIds));
  const allNewIds = newAssignments.flatMap(a => a.memberIds);
  return Array.from(new Set(allNewIds.filter(id => !oldIds.has(id))));
}

/**
 * Computes newly added member IDs by comparing old vs new flow items.
 * Returns only members that appear in newItems but not in oldItems.
 */
export function getNewlyAddedMemberIdsFromFlowItems(
  oldItems: ServiceFlowItem[] | undefined,
  newItems: ServiceFlowItem[]
): string[] {
  const oldIds = new Set(
    (oldItems || []).flatMap(item => item.assignments.flatMap(a => a.memberIds))
  );
  const allNewIds = newItems.flatMap(item => item.assignments.flatMap(a => a.memberIds));
  return Array.from(new Set(allNewIds.filter(id => !oldIds.has(id))));
}
