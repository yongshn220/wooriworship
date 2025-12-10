"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { AuthService } from "@/apis"

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
})

export function ForgotPasswordDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await AuthService.resetPassword(values.email)
            toast({
                title: "Check your email",
                description: "We sent you a password reset link.",
            })
            setOpen(false)
            form.reset()
        } catch (error: any) {
            // Firebase specific error handling could be improved, but generic is okay for now
            let message = "Something went wrong. Please try again."
            if (error.code === 'auth/user-not-found') {
                message = "If an account exists, we sent a link." // Security best practice: don't reveal user existence
                // Or if user prefers convenience: "No user found with this email."
            }
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white/80 backdrop-blur-xl border-white/40 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-slate-800">Reset Password</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Enter your email address and we will send you a link to reset your password.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700">Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="name@example.com" className="bg-white/50 border-slate-200 focus:bg-white" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Reset Link
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
