import { ModernDialog } from "@/components/ui/modern-dialog";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description: string;
  onDeleteHandler: () => Promise<void> | void;
  callback?: () => void;
}

export function DeleteConfirmationDialog({ isOpen, setOpen, title, description, onDeleteHandler, callback }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDeleteHandler();
      setOpen(false);
      if (callback) callback();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ModernDialog
      open={isOpen}
      onOpenChange={setOpen}
      title={title}
      description={description}
      icon={<AlertTriangle className="w-6 h-6 fill-red-100/50" strokeWidth={2} />}
      variant="destructive"
      actionText="Delete"
      onAction={handleConfirm}
      isLoading={isDeleting}
    />
  );
}
