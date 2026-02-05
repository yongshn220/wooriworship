"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface EditNameDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentName: string
    onSave: (newName: string) => Promise<void>
}

const EditNameSchema = z.object({
    name: z.string()
        .min(2, { message: "Name must be at least 2 characters" })
        .max(50, { message: "Name must be at most 50 characters" })
        .trim()
})

type EditNameFormData = z.infer<typeof EditNameSchema>

export function EditNameDialog({
    open,
    onOpenChange,
    currentName,
    onSave
}: EditNameDialogProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<EditNameFormData>({
        resolver: zodResolver(EditNameSchema),
        defaultValues: {
            name: currentName
        }
    })

    useEffect(() => {
        if (open) {
            form.reset({ name: currentName })
        }
    }, [open, currentName, form])

    const onSubmit = async (values: EditNameFormData) => {
        setIsLoading(true)
        try {
            await onSave(values.name)
        } catch (error) {
            console.error("Failed to save name:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Name</DialogTitle>
                    <DialogDescription>
                        Change your display name
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Enter your name"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
