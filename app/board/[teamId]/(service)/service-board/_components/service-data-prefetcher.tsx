"use client";

import { useRecoilValue } from "recoil";
import { usersAtom } from "@/global-states/userState";
import { ServiceFormState } from "@/models/services/ServiceEvent";
import { useServiceMemberIds } from "../_hooks/use-service-member-ids";

interface Props {
    schedule: ServiceFormState;
}

export function ServiceDataPrefetcher({ schedule }: Props): null {
    const allMemberIds = useServiceMemberIds(schedule);

    // access Recoil atom to trigger suspense/fetch
    // We don't need to render anything, just subscribing triggers the fetch.
    useRecoilValue(usersAtom(allMemberIds));

    return null;
}
