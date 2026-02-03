"use client";

import React, { useState, useCallback } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRecoilValue } from "recoil";
import { Timestamp } from "firebase/firestore";

// UI Components
import { Button } from "@/components/ui/button";
import { FullScreenForm, FullScreenFormHeader, FullScreenFormBody, FullScreenFormFooter } from "@/components/common/form/full-screen-form";

// APIs and State
import { ServiceEventApi } from "@/apis/ServiceEventApi";
import { useToast } from "@/components/ui/use-toast";
import { fetchServiceTagsSelector } from "@/global-states/teamState";
import { useServiceDuplicateCheck } from "@/components/common/hooks/use-service-duplicate-check";
import { FormMode } from "@/components/constants/enums";
import { parseLocalDate } from "@/components/util/helper/helper-functions";

// Form Components
import { ServiceDateSelector } from "@/components/common/form/service-date-selector";
import { QuickServiceSelect } from "../service-creation-menu/quick-service-select";

interface Props {
    teamId: string;
    onCompleted?: () => void;
    onClose: () => void;
}

export function ServiceForm({ teamId, onCompleted, onClose }: Props) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [selectedTagId, setSelectedTagId] = useState<string>("");

    // Calendar Month State
    const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

    // Duplicate detection
    const serviceTags = useRecoilValue(fetchServiceTagsSelector(teamId));
    const serviceTagNames = selectedTagId ? [serviceTags?.find((t: any) => t.id === selectedTagId)?.name || selectedTagId] : [];
    const duplicateFetcher = useCallback(async (tid: string, start: string, end?: string) => {
        const s = parseLocalDate(start);
        const e = end ? parseLocalDate(end) : s;
        e.setHours(23, 59, 59);
        const services = await ServiceEventApi.getServiceEvents(tid, s, e);
        return services as unknown as { id: string; tagId?: string; service_tags?: string[] }[];
    }, []);
    const { isDuplicate, duplicateId, errorMessage: duplicateErrorMessage } = useServiceDuplicateCheck({
        teamId,
        date,
        serviceTagIds: selectedTagId ? [selectedTagId] : [],
        serviceTagNames,
        mode: FormMode.CREATE,
        fetcher: duplicateFetcher,
        enabled: !isSubmitting,
    });

    const handleCreate = async () => {
        if (!date) {
            toast({ title: "Date required", description: "Please select a date.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const timestampDate = Timestamp.fromDate(date);

            const newServiceId = await ServiceEventApi.createService(teamId, {
                date: timestampDate,
                tagId: selectedTagId,
                title: "New Service",
            });

            toast({ title: "Service Created", description: "Navigating to new service..." });
            onCompleted?.();
            onClose();
            window.location.reload();
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Failed to create service.", variant: "destructive" });
            setIsSubmitting(false);
        }
    };

    return (
        <FullScreenForm data-testid="service-form">
            <FullScreenFormHeader
                steps={["Create Service"]}
                currentStep={0}
                onStepChange={() => { }}
                onClose={onClose}
            />

            <FullScreenFormBody>
                <div className="flex flex-col gap-8 w-full">
                    <div className="space-y-2 text-center">
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">Create New Service</h2>
                        <span className="text-muted-foreground font-normal text-sm">Select service type and date</span>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Quick Select */}
                        <QuickServiceSelect
                            teamId={teamId}
                            tagId={selectedTagId}
                            onTagIdChange={setSelectedTagId}
                            date={date}
                            onDateChange={(d) => {
                                setDate(d);
                                if (d) setCalendarMonth(d);
                            }}
                            onMonthChange={setCalendarMonth}
                        />

                        {/* Service Tag & Date Selector */}
                        <ServiceDateSelector
                            teamId={teamId}
                            tagId={selectedTagId}
                            onTagIdChange={setSelectedTagId}
                            date={date}
                            onDateChange={(d) => {
                                setDate(d);
                                if (d) setCalendarMonth(d);
                            }}
                            calendarMonth={calendarMonth}
                            onCalendarMonthChange={setCalendarMonth}
                            showQuickSelect={false}
                        />

                        {/* Duplicate Warning */}
                        {isDuplicate && (
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-orange-50 border border-orange-100">
                                <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                <p className="text-xs font-medium text-orange-800">
                                    {duplicateErrorMessage || "This service already exists."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </FullScreenFormBody>

            <FullScreenFormFooter>
                <Button
                    data-testid="form-submit"
                    className="h-12 w-full rounded-full bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    onClick={handleCreate}
                    disabled={isSubmitting || !date || isDuplicate}
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Service <Check className="w-5 h-5 ml-1" /></>}
                </Button>
            </FullScreenFormFooter>
        </FullScreenForm>
    );
}
