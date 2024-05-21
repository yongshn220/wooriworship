"use client"
import {AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,} from "@/components/ui/alert-dialog"
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {LoadingCircle} from "@/components/animation/loading-indicator";


interface Props {
  isOpen: boolean
  setOpen: any
  title: string
  description: string
  onDeleteHandler: Function
  callback?: Function
}
export function DeleteConfirmationDialog({isOpen, setOpen, title, description, onDeleteHandler, callback}: Props) {
  const [isDeleting, setIsDeleting] = useState(false)

  function handleSubmit(e: any) {
    setIsDeleting(true)
    e.preventDefault()

    onDeleteHandler().then(() => {
      setOpen(false)
      setIsDeleting(false)
      if (callback) {
        callback()
      }
    })
  }
  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-500">{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex-end gap-4 mt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <form onSubmit={handleSubmit}>
            <Button type="submit">
              {isDeleting? "Deleting..." : "Delete"}
            </Button>
          </form>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
