import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MoreVertical, SquarePen, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";
import { ServiceEventApi } from "@/apis/ServiceEventApi";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    iconType?: "horizontal" | "vertical";
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
    iconType = "horizontal",
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
            setServices((prev) => prev.filter((s) => s.id !== scheduleId));
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete schedule.",
            });
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };

    if (!user) return null;

    const defaultTrigger = (
        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground data-[state=open]:bg-muted">
            <span className="sr-only">Open menu</span>
            {iconType === "horizontal" ? (
                <MoreHorizontal className="h-5 w-5" />
            ) : (
                <MoreVertical className="h-5 w-5" />
            )}
        </Button>
    );

    const deleteDescription = scheduleTitle && scheduleDate
        ? `Are you sure you want to delete "${scheduleTitle}" on ${scheduleDate}? This action cannot be undone.`
        : "This action cannot be undone. This will permanently delete the serving schedule.";

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {trigger || defaultTrigger}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                        <SquarePen className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
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
