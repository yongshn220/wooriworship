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

export const fetchServingRolesSelector = selectorFamily<ServingRole[], string>({
    key: "fetchServingRolesSelector",
    get: (teamId) => async () => {
        if (!teamId) return [];
        return await ServingService.getRoles(teamId);
    },
});
