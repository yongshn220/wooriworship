import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { useState } from "react";
import { ServiceEventApi } from "@/apis/ServiceEventApi";
import { ServiceDateSelector } from "@/components/common/form/service-date-selector";
import { FullScreenForm, FullScreenFormHeader, FullScreenFormBody, FullScreenFormFooter } from "@/components/common/form/full-screen-form";
import { Timestamp } from "firebase/firestore";
import { auth } from "@/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";
import { serviceEventsListAtom } from "@/global-states/serviceEventState";
import { useToast } from "@/components/ui/use-toast";
import { EntityMenu } from "@/components/common/menu/entity-menu";

interface Props {
    scheduleId: string;
    teamId: string;
    trigger?: React.ReactNode;
    scheduleTitle?: string;
    scheduleDate?: string;
    tagId?: string;
    eventDate?: Date;
    onEdited?: () => void;
}

export function ServiceHeaderMenu({
    scheduleId,
    teamId,
    trigger,
    scheduleTitle,
    scheduleDate,
    tagId,
    eventDate,
    onEdited
}: Props) {
    const [user] = useAuthState(auth as any);
    const { toast } = useToast();
    const setServices = useSetRecoilState(serviceEventsListAtom);

    // Edit dialog state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editDate, setEditDate] = useState<Date | undefined>(undefined);
    const [editTagId, setEditTagId] = useState<string>("");
    const [editCalendarMonth, setEditCalendarMonth] = useState<Date>(new Date());
    const [isSaving, setIsSaving] = useState(false);

    const handleEdit = () => {
        setEditDate(eventDate || undefined);
        setEditTagId(tagId || "");
        if (eventDate) setEditCalendarMonth(eventDate);
        setIsEditDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editDate) return;
        setIsSaving(true);
        try {
            await ServiceEventApi.updateService(teamId, scheduleId, {
                date: Timestamp.fromDate(editDate),
                tagId: editTagId,
            });
            toast({ title: "Service updated" });
            setIsEditDialogOpen(false);
            setServices(prev => prev.map(s =>
                s.id === scheduleId
                    ? { ...s, date: Timestamp.fromDate(editDate), tagId: editTagId }
                    : s
            ));
            onEdited?.();
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Failed to update service." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await ServiceEventApi.deleteService(teamId, scheduleId);
            toast({
                title: "Schedule deleted",
                description: "The serving schedule has been successfully removed.",
            });
            setServices((prev) => prev.filter((s) => s.id !== scheduleId));
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete schedule.",
            });
        }
    };

    if (!user) return null;

    const deleteDescription = scheduleTitle && scheduleDate
        ? `Are you sure you want to delete "${scheduleTitle}" on ${scheduleDate}? This action cannot be undone.`
        : "This action cannot be undone. This will permanently delete the serving schedule.";

    return (
        <>
            <EntityMenu
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleteConfig={{
                    title: "Delete Schedule?",
                    description: deleteDescription,
                }}
                trigger={trigger}
                modal={false}
            />

            {isEditDialogOpen && (
                <FullScreenForm data-testid="edit-service-form">
                    <FullScreenFormHeader
                        steps={["Edit Service"]}
                        currentStep={0}
                        onStepChange={() => {}}
                        onClose={() => setIsEditDialogOpen(false)}
                    />

                    <FullScreenFormBody>
                        <div className="flex flex-col gap-6 w-full">
                            {/* Header */}
                            <div className="space-y-2 text-center">
                                <h2 className="text-2xl font-bold text-foreground tracking-tight">Edit Service</h2>
                                <span className="text-muted-foreground font-normal text-sm">Update service date and type</span>
                            </div>

                            {/* Date Selector */}
                            <ServiceDateSelector
                                teamId={teamId}
                                tagId={editTagId}
                                onTagIdChange={setEditTagId}
                                date={editDate}
                                onDateChange={(d) => {
                                    setEditDate(d);
                                    if (d) setEditCalendarMonth(d);
                                }}
                                calendarMonth={editCalendarMonth}
                                onCalendarMonthChange={setEditCalendarMonth}
                            />
                        </div>
                    </FullScreenFormBody>

                    <FullScreenFormFooter>
                        <Button
                            data-testid="form-submit"
                            className="h-12 w-full rounded-full bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            onClick={handleSave}
                            disabled={isSaving || !editDate}
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Save Changes <Check className="w-5 h-5 ml-1" /></>}
                        </Button>
                    </FullScreenFormFooter>
                </FullScreenForm>
            )}
        </>
    );
}
