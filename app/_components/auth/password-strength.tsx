"use client"

import { cn } from "@/lib/utils"
import { useMemo } from "react"

interface PasswordStrengthProps {
    password?: string
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
    const strength = useMemo(() => {
        if (!password) return 0
        let score = 0
        if (password.length >= 6) score++
        if (password.length >= 10) score++
        if (/[A-Z]/.test(password)) score++
        if (/[0-9]/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++
        return Math.min(score, 4) // Max score 4
    }, [password])

    const color = useMemo(() => {
        if (strength === 0) return "bg-slate-200"
        if (strength <= 1) return "bg-red-500"
        if (strength === 2) return "bg-yellow-500"
        if (strength === 3) return "bg-blue-500"
        return "bg-green-500"
    }, [strength])

    const label = useMemo(() => {
        if (!password) return ""
        if (strength <= 1) return "Weak"
        if (strength === 2) return "Fair"
        if (strength === 3) return "Good"
        return "Strong"
    }, [strength, password])

    return (
        <div className="space-y-1">
            <div className="flex gap-1 h-1.5 w-full">
                {[1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        className={cn(
                            "h-full rounded-full flex-1 transition-all duration-300",
                            level <= strength ? color : "bg-slate-100 dark:bg-slate-700"
                        )}
                    />
                ))}
            </div>
            {label && (
                <p className={cn("text-xs text-right font-medium transition-colors duration-300",
                    strength <= 1 ? "text-red-500" :
                        strength === 2 ? "text-yellow-600" :
                            strength === 3 ? "text-blue-600" : "text-green-600"
                )}>
                    {label}
                </p>
            )}
        </div>
    )
}
