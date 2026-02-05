import { TeamIcon } from "@/components/elements/design/team/team-icon"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, ShieldCheck, ShieldAlert } from "lucide-react"

interface Props {
    name?: string
    description?: string
    teamCount?: number
    action?: React.ReactNode
    // User-related props
    userName?: string
    userEmail?: string
    userRole?: string  // NEW: "Admin" or "Member"
    isEmailVerified?: boolean
    onEditName?: () => void
    onResendVerification?: () => void
    isResending?: boolean
}

export function TeamProfileCard({
    name,
    description,
    teamCount,
    action,
    userName,
    userEmail,
    userRole,
    isEmailVerified,
    onEditName,
    onResendVerification,
    isResending
}: Props) {
    return (
        <div className="bg-card px-3 py-4 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center text-center mb-5">
            <div className="mb-4 transform scale-125">
                <TeamIcon name={name} />
            </div>

            <h2 className="text-lg font-bold text-foreground mb-1">
                {name || "Unnamed Team"}
            </h2>

            <div className="text-sm text-muted-foreground mb-4">
                Current Workspace
            </div>

            {action}

            {/* User Profile Section */}
            {userName && (
                <>
                    <div className="w-full border-t border-border my-4" />

                    {/* Profile Card */}
                    <div className="flex items-center gap-3 px-2 py-1">
                        {/* User Icon */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-6 h-6 text-muted-foreground" />
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="text-base font-semibold text-foreground">
                                    {userName}
                                </h3>
                                {isEmailVerified && (
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                        <ShieldCheck className="w-3 h-3 text-white" strokeWidth={3} />
                                    </div>
                                )}
                            </div>

                            {userRole && (
                                <p className="text-xs text-muted-foreground font-medium mb-0.5">
                                    {userRole}
                                </p>
                            )}

                            {userEmail && (
                                <p className="text-sm text-muted-foreground truncate">
                                    {userEmail}
                                </p>
                            )}
                        </div>

                        {/* Edit Button */}
                        {onEditName && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onEditName}
                                className="h-8 px-3 text-primary font-semibold hover:bg-transparent"
                            >
                                Edit
                            </Button>
                        )}
                    </div>

                    {/* Unverified Badge (if not verified) */}
                    {!isEmailVerified && userEmail && (
                        <div className="px-2 mt-2">
                            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                <span className="text-xs text-amber-700 font-medium">Email not verified</span>
                            </div>
                        </div>
                    )}

                    {/* Resend verification button */}
                    {!isEmailVerified && userEmail && onResendVerification && (
                        <div className="px-2 mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs"
                                onClick={onResendVerification}
                                disabled={isResending}
                            >
                                {isResending && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
                                Resend verification email
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
