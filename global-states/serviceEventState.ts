import { atom, selector, selectorFamily, atomFamily } from "recoil";
import { ServiceEvent, ServiceSetlist, ServicePraiseAssignee, ServiceFlow } from "@/models/services/ServiceEvent";
import { ServiceEventApi } from "@/apis/ServiceEventApi";

// =============================================================================
// 1. Selection State
// =============================================================================
export const currentServiceIdAtom = atom<string | null>({
    key: "currentServiceIdAtom",
    default: null,
});

// =============================================================================
// 2. Data Cache Atoms (Family by ID)
// =============================================================================
export const serviceEventAtom = atomFamily<ServiceEvent | null, string>({
    key: "serviceEventAtom",
    default: null,
});

export const serviceSetlistAtom = atomFamily<ServiceSetlist | null, string>({
    key: "serviceSetlistAtom",
    default: null,
});

export const servicePraiseAssigneeAtom = atomFamily<ServicePraiseAssignee | null, string>({
    key: "servicePraiseAssigneeAtom",
    default: null,
});

export const serviceFlowAtom = atomFamily<ServiceFlow | null, string>({
    key: "serviceFlowAtom",
    default: null,
});

// =============================================================================
// 3. Selectors (Fetchers)
// =============================================================================

/**
 * Selector to fetch full details for the CURRENTLY selected service.
 * Used by the Detail View.
 */
export const currentServiceDetailSelector = selector({
    key: "currentServiceDetailSelector",
    get: async ({ get }) => {
        const serviceId = get(currentServiceIdAtom);
        if (!serviceId) return null;

        // Check cache first? (Optional optimization)
        // For now, let's fetch fresh data on selection change
        // In a real app, we might check if atom families are populated.

        // However, a selector "get" cannot set atoms directly.
        // Pattern: Component calls a hook that triggers fetch and sets atoms.
        // OR: Selector returns the promise.

        // Simple Read-Only View Pattern:
        // The View subscribes to this selector.
        // Note: For editing, we usually sync atoms.

        // Let's use the pattern where the View uses useRecoilCallback to fetch and set.
        // But for "Reading", this selector is fine.

        // Wait, atoms are better for Edit forms. 
        // Let's assume we load data into the atoms when selected.
        return null;
    }
});

// Updater Trigger for refreshing list
export const serviceListUpdaterAtom = atom({
    key: "serviceListUpdaterAtom",
    default: 0
});

// List Atom for Calendar Strip
export const serviceEventsListAtom = atom<ServiceEvent[]>({
    key: "serviceEventsListAtom",
    default: []
});
