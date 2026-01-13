import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getPathEditPlan } from "@/components/util/helper/routes";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";
import { WorshipService } from "@/apis";
import { useToast } from "@/components/ui/use-toast";
import { useSetRecoilState } from "recoil";
import { worshipIdsUpdaterAtom } from "@/global-states/worship-state";
import { auth } from "@/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

interface Props {
    worshipId: string;
    createdById: string;
    teamId: string;
    trigger?: React.ReactNode;
}

export function WorshipHeaderMenu({ worshipId, createdById, teamId, trigger }: Props) {
    const [user] = useAuthState(auth as any);
    const router = useRouter();
    const { toast } = useToast();
    const setWorshipIdsUpdater = useSetRecoilState(worshipIdsUpdaterAtom);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleEdit = () => {
        router.push(getPathEditPlan(teamId, worshipId));
    };

    const handleDelete = async () => {
        try {
            if (user?.uid !== createdById) {
                toast({
                    variant: "destructive",
                    title: "Permission denied",
                    description: "Only the creator can delete this worship plan.",
                });
                return;
            }

            await WorshipService.deleteWorship(worshipId);
            toast({
                title: "Worship plan deleted",
                description: "The worship plan has been successfully removed.",
            });
            setWorshipIdsUpdater((prev) => prev + 1);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete worship plan.",
            });
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };

    if (!user) return null;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {trigger || (
                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground data-[state=open]:bg-muted">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                        <SquarePen className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                    </DropdownMenuItem>

                    {user.uid === createdById && (
                        <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteConfirmationDialog
                isOpen={isDeleteDialogOpen}
                setOpen={setIsDeleteDialogOpen}
                title="Delete Worship Plan?"
                description="This action cannot be undone. This will permanently delete the worship plan and remove it from our servers."
                onDeleteHandler={handleDelete}
            />
        </>
    );
}
