import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SquarePen, Trash2Icon, MoreHorizontal } from "lucide-react";
import { getPathEditNotice } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { useState } from "react";
import { noticeUpdaterAtom, noticeIdsUpdaterAtom } from "@/global-states/notice-state";
import { NoticeService } from "@/apis";
import { toast } from "@/components/ui/use-toast";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";

interface Props {
  noticeId: string
  createdById: string
}

export function NoticeHeaderMenu({ noticeId, createdById }: Props) {
  const [user] = useAuthState(auth as any);
  const teamId = useRecoilValue(currentTeamIdAtom)
  useSetRecoilState(noticeUpdaterAtom)
  const setNoticeIdsUpdater = useSetRecoilState(noticeIdsUpdaterAtom)
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!user || user.uid !== createdById) return null;

  const handleDelete = async () => {
    try {
      await NoticeService.deleteNotice(teamId, noticeId);
      toast({
        title: "Notice deleted",
        description: "The notice has been successfully deleted.",
      });
      setNoticeIdsUpdater((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete notice.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/20">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <Button variant="ghost" className="cursor-pointer w-full flex-start pl-2" onClick={() => router.push(getPathEditNotice(teamId, noticeId))}>
              <SquarePen className="mr-3 w-5 h-5" />
              <p>Edit</p>
            </Button>
            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 cursor-pointer w-full flex-start pl-2"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2Icon className="mr-3 w-5 h-5" />
              <p>Delete</p>
            </Button>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        title="Delete Notice?"
        description="This action cannot be undone. This will permanently delete the notice and remove associated files from our servers."
        onDeleteHandler={handleDelete}
      />
    </>
  )
}
