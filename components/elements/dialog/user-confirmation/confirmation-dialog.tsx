import { ModernDialog } from "@/components/ui/modern-dialog";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";

type ConfirmationVariant = 'destructive' | 'warning' | 'primary';

interface Props {
  isOpen: boolean
  setOpen: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => Promise<void> | void
  callback?: () => void
  variant?: ConfirmationVariant
  actionText?: string
}

const variantConfig = {
  destructive: {
    icon: <AlertTriangle className="w-6 h-6 fill-red-100/50" strokeWidth={2} />,
    variant: 'destructive' as const,
    actionText: 'Delete'
  },
  warning: {
    icon: <AlertCircle className="w-6 h-6 fill-amber-100/50 text-amber-600" strokeWidth={2} />,
    variant: 'primary' as const,
    actionText: 'Confirm'
  },
  primary: {
    icon: <Info className="w-6 h-6 fill-blue-100/50 text-blue-600" strokeWidth={2} />,
    variant: 'primary' as const,
    actionText: 'Confirm'
  }
};

export function ConfirmationDialog({
  isOpen,
  setOpen,
  title,
  description,
  onConfirm,
  callback,
  variant = 'warning',
  actionText
}: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const config = variantConfig[variant];

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
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
      icon={config.icon}
      variant={config.variant}
      actionText={actionText || config.actionText}
      cancelText="Cancel"
      onAction={handleConfirm}
      isLoading={isProcessing}
    />
  );
}
