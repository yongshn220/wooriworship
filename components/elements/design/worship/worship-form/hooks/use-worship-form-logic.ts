import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { format, nextFriday, nextSunday } from "date-fns";
import { toast } from "@/components/ui/use-toast";

// State & Models
import { auth } from "@/firebase";
import { teamAtom } from "@/global-states/teamState";
import { worshipUpdaterAtom, worshipIdsUpdaterAtom, currentWorshipIdAtom } from "@/global-states/worship-state";
import { FormMode } from "@/components/constants/enums";
import { Worship, WorshipSongHeader } from "@/models/worship";
import { timestampToDate, getServiceTitleFromTags } from "@/components/util/helper/helper-functions";

// Services & Routes
import { WorshipService, ServingService } from "@/apis";
import PushNotificationService from "@/apis/PushNotificationService";
import { getPathPlan } from "@/components/util/helper/routes";

// Hooks
import { useServiceDuplicateCheck } from "@/components/common/hooks/use-service-duplicate-check";

interface UseWorshipFormLogicProps {
    mode: FormMode;
    teamId: string;
    initialWorship?: Worship;
}

export function useWorshipFormLogic({ mode, teamId, initialWorship }: UseWorshipFormLogicProps) {
    const router = useRouter();
    const authUser = auth.currentUser;
    const team = useRecoilValue(teamAtom(teamId));

    // Global updaters (to refresh boards after save)
    const setWorshipUpdater = useSetRecoilState(worshipUpdaterAtom);
    const setWorshipIdsUpdater = useSetRecoilState(worshipIdsUpdaterAtom);
    const setCurrentWorshipId = useSetRecoilState(currentWorshipIdAtom);

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
    const [songs, setSongs] = useState<WorshipSongHeader[]>(initialWorship?.songs ?? []);

    const [beginningSong, setBeginningSong] = useState<WorshipSongHeader | null>(initialWorship?.beginning_song ?? null);
    const [endingSong, setEndingSong] = useState<WorshipSongHeader | null>(initialWorship?.ending_song ?? null);

    // Linked Serving
    const [availableServingSchedules, setAvailableServingSchedules] = useState<any[]>([]);
    const [linkedServingId, setLinkedServingId] = useState<string | null>(initialWorship?.serving_schedule_id ?? null);
    const [isLoading, setIsLoading] = useState(false);


    // --- Effects ---

    // 1. Fetch Linked Servings
    useEffect(() => {
        const fetchLinkedServings = async () => {
            if (!date || !teamId) return;
            try {
                const dateStr = format(date, 'yyyy-MM-dd');
                const schedules = await ServingService.getSchedules(teamId, dateStr, dateStr);
                const filtered = schedules.filter(s =>
                    serviceTagIds.some(t => s.service_tags?.includes(t)) ||
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
        fetcher: async (tid, dateObjOrStr) => {
            // Fetcher expects date, but here we use WorshipService which might expect Date obj
            // WorshipService.getWorshipsByDate expects Date object.
            // But useServiceDuplicateCheck passes... wait, the hook passes 'date' which is Date obj.
            const dateObj = date; // closure
            const worships = await WorshipService.getWorshipsByDate(tid, dateObj);
            return worships.map(w => ({ ...w, id: w.id! }));
        }
    });


    // --- Handlers ---

    const handleCreate = async () => {
        setIsLoading(true);
        if (!auth.currentUser) return;
        try {
            const worshipInput = {
                title: getServiceTitleFromTags(serviceTagIds, team?.service_tags),
                service_tags: serviceTagIds,
                description: basicInfo.description,
                date: date,
                link: basicInfo.link,
                worshipSongHeaders: songs,
                beginningSong: beginningSong,
                endingSong: endingSong,
                related_serving_id: linkedServingId
            };

            const worshipId = await WorshipService.addNewWorship(auth.currentUser.uid, teamId, worshipInput);
            await PushNotificationService.notifyTeamNewWorship(teamId, auth.currentUser.uid, worshipInput.date, worshipInput.title);

            toast({ title: "New service created!" });
            cleanupAndRedirect(worshipId);
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
            const worshipInput = {
                title: getServiceTitleFromTags(serviceTagIds, team?.service_tags),
                service_tags: serviceTagIds,
                description: basicInfo.description,
                date: date,
                link: basicInfo.link,
                worshipSongHeaders: songs,
                beginningSong: beginningSong,
                endingSong: endingSong,
                related_serving_id: linkedServingId
            };

            await WorshipService.updateWorship(auth.currentUser.uid, teamId, initialWorship.id, worshipInput);
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
        setWorshipUpdater(prev => prev + 1);
        setWorshipIdsUpdater(prev => prev + 1);
        setCurrentWorshipId(id);
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
