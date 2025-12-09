import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import MenuIcon from "@/public/icons/menuIcon.svg";
import { Button } from "@/components/ui/button";
import { SquarePen, Trash2Icon } from "lucide-react";
import { getPathEditNotice } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { useState } from "react";
import { noticeUpdaterAtom } from "@/global-states/notice-state";
import { NoticeService } from "@/apis";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  noticeId: string
}

export function NoticeHeaderMenu({ noticeId }: Props) {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const noticeUpdater = useSetRecoilState(noticeUpdaterAtom)
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await NoticeService.deleteNotice(noticeId);
      toast({
        title: "Notice deleted",
        description: "The notice has been successfully deleted.",
      });
      noticeUpdater((prev) => prev + 1);
    } catch (error) {
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
        <DropdownMenuTrigger>
          <MenuIcon />
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the notice and remove associated files from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
