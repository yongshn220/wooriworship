'use client'
import { RoutingPage } from "@/app/_components/routing-page";
import { LandingPage } from "@/app/_components/landing-page";
import { useEffect, useState } from "react";
import { auth } from "@/firebase";
import { getPathBoard, getPathPlan } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";
import { UserApi, TeamApi } from "@/apis";
import useUserPreferences from "@/components/util/hook/use-local-preference";
import { sendEmailVerification, onAuthStateChanged, signOut } from "firebase/auth";


enum AuthStatus {
  PROCESSING,
  VALID,
  NOT_VALID,
  EMAIL_NOT_VERIFIED,
}

export default function RoutePage() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.PROCESSING)
  const [preferences, _] = useUserPreferences()
  const router = useRouter()
  const [isResending, setIsResending] = useState(false)

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      setIsResending(true);
      try {
        await sendEmailVerification(auth.currentUser);
        alert("Verification email resent! Please check your inbox."); // Using alert for simplicity as toast might not be available here easily without hook setup
      } catch (error) {
        console.error(error);
        alert("Failed to resend email. Please try again later.");
      } finally {
        setIsResending(false);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        // if (!authUser.emailVerified) {
        //   setAuthStatus(AuthStatus.EMAIL_NOT_VERIFIED);
        //   return;
        // }

        UserApi.getById(authUser.uid).then(async (user: any) => {
          if (!user) {
            return;
          }

          if (!user.teams?.length) {
            router.replace(getPathBoard())
            return
          }

          // Determine preferred team, then verify it exists in Firestore
          const preferredId = preferences.board.selectedTeamId
          const candidateIds = preferredId && user.teams.includes(preferredId)
            ? [preferredId, ...user.teams.filter((id: string) => id !== preferredId)]
            : [...user.teams]

          for (const candidateId of candidateIds) {
            const team = await TeamApi.getById(candidateId)
            if (team) {
              router.replace(getPathPlan(candidateId))
              return
            }
          }

          // All teams are stale — go to team selector
          router.replace(getPathBoard())
        })
      }
      else {
        setAuthStatus(AuthStatus.NOT_VALID)
      }
    });
    return () => unsubscribe()
  }, [preferences.board.selectedTeamId, router]);

  return (
    <div className="w-full h-full">
      {
        authStatus === AuthStatus.NOT_VALID
          ? <LandingPage />
          : authStatus === AuthStatus.EMAIL_NOT_VERIFIED
            ? (
              <div className="flex flex-col items-center justify-center h-screen bg-white space-y-4">
                <h1 className="text-2xl font-bold text-slate-800">Please Verify Your Email</h1>
                <p className="text-slate-600 text-center max-w-sm">
                  We sent a verification link to your email address.<br />
                  <span className="text-sm text-slate-500">(Don&apos;t see it? Check your spam folder)</span>
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                  >
                    I verified my email
                  </button>
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
                  >
                    {isResending ? "Sending..." : "Resend Email"}
                  </button>
                </div>
                <button
                  onClick={() => signOut(auth)}
                  className="text-sm text-slate-400 hover:text-slate-600 underline"
                >
                  Sign out
                </button>
              </div>
            )
            : <RoutingPage />
      }
    </div>
  )
}


//
// function InstallPrompt() {
//   const [isIOS, setIsIOS] = useState(false)
//   const [isStandalone, setIsStandalone] = useState(false)
//
//   useEffect(() => {
//     setIsIOS(
//       /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
//     )
//
//     setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
//   }, [])
//
//   if (isStandalone) {
//     return null // Don't show install button if already installed
//   }
//
//   return (
//     <div>
//       <h3>Install App</h3>
//       <button>Add to Home Screen</button>
//       {isIOS && (
//         <p>
//           To install this app on your iOS device, tap the share button
//           <span role="img" aria-label="share icon">
//             {' '}
//             ⎋{' '}
//           </span>
//           and then "Add to Home Screen"
//           <span role="img" aria-label="plus icon">
//             {' '}
//             ➕{' '}
//           </span>.
//         </p>
//       )}
//     </div>
//   )
// }
