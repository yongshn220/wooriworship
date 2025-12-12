import { atom, selectorFamily } from "recoil";
import { ServingRole, ServingSchedule } from "@/models/serving";
import { ServingService } from "@/apis";

export const servingRolesAtom = atom<ServingRole[]>({
    key: "servingRolesAtom",
    default: [],
});

export const servingSchedulesAtom = atom<ServingSchedule[]>({
    key: "servingSchedulesAtom",
    default: [],
});

export const servingRolesUpdaterAtom = atom({
    key: "servingRolesUpdaterAtom",
    default: 0,
});

export const fetchServingRolesSelector = selectorFamily<ServingRole[], string>({
    key: "fetchServingRolesSelector",
    get: (teamId) => async ({ get }) => {
        get(servingRolesUpdaterAtom); // Dependency
        if (!teamId) return [];
        return await ServingService.getRoles(teamId);
    },
});
