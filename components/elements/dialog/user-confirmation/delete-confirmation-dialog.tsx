import { ConfirmationDialog } from "./confirmation-dialog";

interface Props {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description: string;
  onDeleteHandler: () => Promise<void> | void;
  callback?: () => void;
}

/**
 * DeleteConfirmationDialog is a wrapper around ConfirmationDialog with variant="destructive"
 * Kept for backward compatibility with existing code.
 */
export function DeleteConfirmationDialog({
  isOpen,
  setOpen,
  title,
  description,
  onDeleteHandler,
  callback
}: Props) {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      setOpen={setOpen}
      title={title}
      description={description}
      onConfirm={onDeleteHandler}
      callback={callback}
      variant="destructive"
    />
  );
}
