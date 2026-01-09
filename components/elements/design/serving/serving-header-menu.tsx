import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MoreVertical, SquarePen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getPathEditServing } from "@/components/util/helper/routes";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";
import { ServingService } from "@/apis";
import { useToast } from "@/components/ui/use-toast";
import { useSetRecoilState } from "recoil";
import { servingSchedulesAtom } from "@/global-states/servingState";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";

interface Props {
    scheduleId: string;
    teamId: string;
    trigger?: React.ReactNode;
    iconType?: "horizontal" | "vertical";
    scheduleTitle?: string;
    scheduleDate?: string;
}

export function ServingHeaderMenu({
    scheduleId,
    teamId,
    trigger,
    iconType = "horizontal",
    scheduleTitle,
    scheduleDate
}: Props) {
    const [user] = useAuthState(auth as any);
    const router = useRouter();
    const { toast } = useToast();
    const setSchedules = useSetRecoilState(servingSchedulesAtom);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleEdit = () => {
        router.push(getPathEditServing(teamId, scheduleId));
    };

    const handleDelete = async () => {
        try {
            await ServingService.deleteSchedule(teamId, scheduleId);
            toast({
                title: "Schedule deleted",
                description: "The serving schedule has been successfully removed.",
            });
            setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
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
        </>
    );
}
