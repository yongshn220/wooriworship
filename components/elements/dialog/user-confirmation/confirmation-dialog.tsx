import { ModernDialog } from "@/components/ui/modern-dialog";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

interface Props {
  isOpen: boolean
  setOpen: (open: boolean) => void
  title: string
  description: string
  onDeleteHandler: () => Promise<void> | void
  callback?: () => void
}

export function ConfirmationDialog({ isOpen, setOpen, title, description, onDeleteHandler, callback }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onDeleteHandler();
      setOpen(false);
      if (callback) callback();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ModernDialog
      open={isOpen}
      onOpenChange={setOpen}
      title={title}
      description={description}
      icon={<AlertCircle className="w-6 h-6 fill-amber-100/50 text-amber-600" strokeWidth={2} />}
      variant="primary"
      actionText="Confirm"
      cancelText="Cancel"
      onAction={handleConfirm}
      isLoading={isProcessing}
    />
  );
}
