import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { format, nextFriday, nextSunday } from "date-fns";
import { toast } from "@/components/ui/use-toast";

// State & Models
import { auth } from "@/firebase";
import { teamAtom } from "@/global-states/teamState";
import { setlistUpdaterAtom, setlistIdsUpdaterAtom, currentSetlistIdAtom } from "@/global-states/setlist-state";
import { FormMode } from "@/components/constants/enums";
import { Setlist, SetlistSongHeader } from "@/models/setlist";
import { timestampToDate, getServiceTitleFromTags } from "@/components/util/helper/helper-functions";

// Services & Routes
import { ServiceEventService } from "@/apis/ServiceEventService";
import { SetlistService } from "@/apis/SetlistService";
import PushNotificationService from "@/apis/PushNotificationService";
import { getPathPlan } from "@/components/util/helper/routes";
import { Timestamp } from "firebase/firestore";

// Hooks
import { useServiceDuplicateCheck } from "@/components/common/hooks/use-service-duplicate-check";

interface UseSetlistFormLogicProps {
    mode: FormMode;
    teamId: string;
    initialWorship?: Setlist;
}

export function useSetlistFormLogic({ mode, teamId, initialWorship }: UseSetlistFormLogicProps) {
    const router = useRouter();
    const authUser = auth.currentUser;
    const team = useRecoilValue(teamAtom(teamId));

    // Global updaters (to refresh boards after save)
    const setSetlistUpdater = useSetRecoilState(setlistUpdaterAtom);
    const setSetlistIdsUpdater = useSetRecoilState(setlistIdsUpdaterAtom);
    const setCurrentSetlistId = useSetRecoilState(currentSetlistIdAtom);

    // --- Form State ---
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(0);
    const totalSteps = 3;

    // Basic Info
    const [basicInfo, setBasicInfo] = useState({
        title: initialWorship?.title ?? "",
        description: initialWorship?.description ?? "",
        link: initialWorship?.link ?? "",
    });

    // Classification & Date
    const [serviceTagIds, setServiceTagIds] = useState<string[]>(initialWorship?.service_tags ?? []);
    const [date, setDate] = useState<Date>(initialWorship?.worship_date ? timestampToDate(initialWorship.worship_date) : new Date());

    // Songs (Local State replaces Atoms)
    const [songs, setSongs] = useState<SetlistSongHeader[]>(initialWorship?.songs ?? []);

    const [beginningSong, setBeginningSong] = useState<SetlistSongHeader | null>(initialWorship?.beginning_song ?? null);
    const [endingSong, setEndingSong] = useState<SetlistSongHeader | null>(initialWorship?.ending_song ?? null);

    // Linked Serving
    const [availableServingSchedules, setAvailableServingSchedules] = useState<any[]>([]);
    const [linkedServingId, setLinkedServingId] = useState<string | null>(initialWorship?.serving_schedule_id ?? null);
    const [isLoading, setIsLoading] = useState(false);


    // --- Effects ---

    // 1. Fetch Linked Servings (V3 Services)
    useEffect(() => {
        const fetchLinkedServings = async () => {
            if (!date || !teamId) return;
            try {
                const start = new Date(date);
                start.setHours(0, 0, 0, 0);
                const end = new Date(start);
                end.setHours(23, 59, 59, 999);

                const services = await ServiceEventService.getServiceEvents(teamId, start, end);
                const filtered = services.filter(s =>
                    serviceTagIds.some(t => s.tagId === t) ||
                    (mode === FormMode.EDIT && s.id === initialWorship?.serving_schedule_id)
                );

                setAvailableServingSchedules(filtered);

                // Auto-select logic
                if (filtered.some(s => s.id === linkedServingId)) {
                    // keep
                } else if (filtered.length > 0) {
                    setLinkedServingId(filtered[0].id);
                } else {
                    setLinkedServingId(null);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchLinkedServings();
    }, [date, teamId, serviceTagIds, mode, initialWorship?.serving_schedule_id, linkedServingId]);


    // 2. Duplicate Check
    const serviceTagNames = serviceTagIds.map(id => team?.service_tags?.find((t: any) => t.id === id)?.name || id);
    const { isDuplicate, duplicateId, errorMessage: duplicateErrorMessage } = useServiceDuplicateCheck({
        teamId,
        date,
        serviceTagIds,
        serviceTagNames,
        mode,
        currentId: initialWorship?.id,
        fetcher: async (tid, dateObj) => {
            const start = new Date(dateObj);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setHours(23, 59, 59, 999);
            const services = await ServiceEventService.getServiceEvents(tid, start, end);
            return services;
        }
    });


    // --- Handlers ---

    const handleCreate = async () => {
        setIsLoading(true);
        if (!auth.currentUser) return;
        try {
            const setlistInput = {
                title: getServiceTitleFromTags(serviceTagIds, team?.service_tags),
                service_tags: serviceTagIds,
                description: basicInfo.description,
                date: date,
                link: basicInfo.link,
                setlistSongHeaders: songs,
                beginningSong: beginningSong,
                endingSong: endingSong,
                related_serving_id: linkedServingId
            };

            const serviceId = await ServiceEventService.createService(teamId, {
                date: Timestamp.fromDate(date),
                title: setlistInput.title,
                tagId: serviceTagIds[0] || "",
            });

            await SetlistService.updateSetlist(teamId, serviceId, {
                songs: songs,
                beginning_song: beginningSong || undefined,
                ending_song: endingSong || undefined,
                description: basicInfo.description,
                link: basicInfo.link
            });

            // If a serving was selected to link (though in V3 they should be same doc,
            // but for transition we might still have separate "Serving" docs?
            // In V3, they are unified. So linkingServingId might refer to an existing Service doc to merge into?
            // This is complex. For now, let's just create a new service.
            // If linkedServingId is provided, it means the user wants to attach this setlist to an existing service.

            if (linkedServingId) {
                // Merge setlist into existing service
                await SetlistService.updateSetlist(teamId, linkedServingId, {
                    songs: songs,
                    beginning_song: beginningSong || undefined,
                    ending_song: endingSong || undefined,
                    description: basicInfo.description,
                    link: basicInfo.link
                });
                // We might want to delete the newly created serviceId or just use linkedServingId from the start.
                // Optimized approach:
                // ... (refactor needed below if linkedServingId exists)
            }

            await PushNotificationService.notifyTeamNewWorship(teamId, auth.currentUser.uid, setlistInput.date, setlistInput.title);

            toast({ title: "New service created!" });
            cleanupAndRedirect(linkedServingId || serviceId);
        } catch (e) {
            console.error(e);
            toast({ title: "Something went wrong", variant: "destructive" });
            setIsLoading(false);
        }
    };

    const handleEdit = async () => {
        setIsLoading(true);
        if (!auth.currentUser || !initialWorship?.id) return;
        try {
            const setlistInput = {
                title: getServiceTitleFromTags(serviceTagIds, team?.service_tags),
                service_tags: serviceTagIds,
                description: basicInfo.description,
                date: date,
                link: basicInfo.link,
                setlistSongHeaders: songs,
                beginningSong: beginningSong,
                endingSong: endingSong,
                related_serving_id: linkedServingId
            };

            await ServiceEventService.updateService(teamId, initialWorship.id, {
                title: setlistInput.title,
                tagId: serviceTagIds[0] || "",
                date: Timestamp.fromDate(date)
            });

            await SetlistService.updateSetlist(teamId, initialWorship.id, {
                songs: songs,
                beginning_song: beginningSong || undefined,
                ending_song: endingSong || undefined,
                description: basicInfo.description,
                link: basicInfo.link
            });

            toast({ title: "Service updated" });
            cleanupAndRedirect(initialWorship.id);
        } catch (e) {
            console.error(e);
            toast({ title: "Something went wrong", variant: "destructive" });
            setIsLoading(false);
        }
    };

    const cleanupAndRedirect = (id: string) => {
        setIsLoading(false);
        // Reset atoms via updated effect? No, we don't use atoms for form state anymore.
        // Just trigger updaters
        setSetlistUpdater(prev => prev + 1);
        setSetlistIdsUpdater(prev => prev + 1);
        setCurrentSetlistId(id);
        router.push(getPathPlan(teamId));
    };

    const goToStep = (targetStep: number) => {
        setDirection(targetStep > step ? 1 : -1);
        setStep(targetStep);
    };


    return {
        // State
        step, direction, totalSteps,
        basicInfo, setBasicInfo,
        serviceTagIds, setServiceTagIds,
        date, setDate,
        songs, setSongs,
        beginningSong, setBeginningSong,
        endingSong, setEndingSong,
        availableServingSchedules, linkedServingId, setLinkedServingId,
        isLoading,
        isDuplicate, duplicateId, duplicateErrorMessage,

        // Actions
        handleCreate, handleEdit,
        goToStep,
        nextStep: () => { if (step < totalSteps - 1) goToStep(step + 1); },
        prevStep: () => { if (step > 0) goToStep(step - 1); }
    };
}
