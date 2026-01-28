import { atom, selectorFamily } from "recoil";
import { ServiceRole, ServiceFormState } from "@/models/services/ServiceEvent";
import { PraiseTeamApi } from "@/apis/PraiseTeamApi";

export const servingRolesAtom = atom<ServiceRole[]>({
    key: "servingRolesAtom",
    default: [],
});

export const servingSchedulesAtom = atom<ServiceFormState[]>({
    key: "servingSchedulesAtom",
    default: [],
});

export const servingRolesUpdaterAtom = atom({
    key: "servingRolesUpdaterAtom",
    default: 0,
});

export const fetchServingRolesSelector = selectorFamily<ServiceRole[], string>({
    key: "fetchServingRolesSelector",
    get: (teamId) => async ({ get }) => {
        get(servingRolesUpdaterAtom); // Dependency
        if (!teamId) return [];
        return await PraiseTeamApi.getRoles(teamId);
    },
});
