import { Button } from "@/components/ui/button";
import { EllipsisVertical, SquarePen, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";
import { ServiceEventApi } from "@/apis/ServiceEventApi";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceDateSelector } from "@/components/common/form/service-date-selector";
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

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md rounded-3xl p-6 pt-10">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold">Edit Service</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
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
                    <Button
                        className="w-full h-12 rounded-xl text-base font-semibold shadow-lg"
                        size="lg"
                        onClick={handleSave}
                        disabled={isSaving || !editDate}
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}
