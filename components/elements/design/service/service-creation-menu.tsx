"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ServiceEventApi } from "@/apis/ServiceEventApi";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { useState } from "react";
import { ServiceDateSelector } from "@/components/common/form/service-date-selector";
import { Button } from "@/components/ui/button";
import { addDays, nextSunday } from "date-fns";
import { Timestamp } from "firebase/firestore";

interface Props {
    teamId: string;
}

const CreateActionButton = () => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
    >
        <Plus className="w-5 h-5 stroke-[3px]" />
    </motion.button>
);

export function ServiceCreationMenu({ teamId }: Props) {
    const router = useRouter();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [selectedTagId, setSelectedTagId] = useState<string>("");

    // Calendar Month State (for controlling calendar view if needed)
    const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

    const handleCreate = async () => {
        if (!date) {
            toast({ title: "Date required", description: "Please select a date.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            // Convert Date to Timestamp
            const timestampDate = Timestamp.fromDate(date);

            const newServiceId = await ServiceEventApi.createService(teamId, {
                date: timestampDate,
                tagId: selectedTagId,
                title: "New Service", // Default fallback, UI will show tag name if possible
            });

            toast({ title: "Service Created", description: "Navigating to new service..." });
            setIsOpen(false);

            // Navigate
            // The Page component listens to selectedId? Or we push to route?
            // Page uses `useCalendarNavigation`. Query param logic is custom.
            // Usually we just refresh or let the list auto-update. 
            // The user wants to "Navigate to the newly created service page".
            // Since everything is on `service-board` page with query/state selection, 
            // efficiently we might just set the selection if possible, but route refresh is safer.
            // Actually, `ServiceEventApi.createService` returns ID.

            // We can force reload or just wait for live query if using onSnapshot (we aren't).
            // We fetch in useEffect. So we need to trigger re-fetch.
            // Simplified: Refresh page.
            window.location.reload();

        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Failed to create service.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div><CreateActionButton /></div>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl p-6 pt-10">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold">Create New Service</DialogTitle>
                </DialogHeader>

                <div className="py-4">
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
                    />
                </div>

                <Button
                    className="w-full h-12 rounded-xl text-base font-semibold shadow-lg"
                    size="lg"
                    onClick={handleCreate}
                    disabled={isSubmitting || !date}
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Service"}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
