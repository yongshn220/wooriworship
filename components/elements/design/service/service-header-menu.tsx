import { Button } from "@/components/ui/button";
import { EllipsisVertical, SquarePen, Trash2, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";
import { ServiceEventApi } from "@/apis/ServiceEventApi";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceDateSelector } from "@/components/common/form/service-date-selector";
import { FullScreenForm, FullScreenFormHeader, FullScreenFormBody, FullScreenFormFooter } from "@/components/common/form/full-screen-form";
import { Timestamp } from "firebase/firestore";

import { auth } from "@/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";
import { serviceEventsListAtom } from "@/global-states/serviceEventState";
import { useToast } from "@/components/ui/use-toast";

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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
            setIsDeleteDialogOpen(false);
            setServices((prev) => prev.filter((s) => s.id !== scheduleId));
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete schedule.",
            });
            setIsDeleteDialogOpen(false);
        }
    };

    if (!user) return null;

    const deleteDescription = scheduleTitle && scheduleDate
        ? `Are you sure you want to delete "${scheduleTitle}" on ${scheduleDate}? This action cannot be undone.`
        : "This action cannot be undone. This will permanently delete the serving schedule.";

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {trigger ? (
                        <span>{trigger}</span>
                    ) : (
                        <button
                            className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg hover:bg-muted/60 active:bg-muted outline-none"
                        >
                            <EllipsisVertical className="w-5 h-5" />
                        </button>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onSelect={handleEdit}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        Edit
                        <SquarePen className="w-4 h-4 text-muted-foreground" />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="flex items-center justify-between cursor-pointer text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 dark:focus:text-red-500"
                    >
                        Delete
                        <Trash2 className="w-4 h-4" />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteConfirmationDialog
                isOpen={isDeleteDialogOpen}
                setOpen={setIsDeleteDialogOpen}
                title="Delete Schedule?"
                description={deleteDescription}
                onDeleteHandler={handleDelete}
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
