'use client'
import { RoutingPage } from "@/app/_components/routing-page";
import { LandingPage } from "@/app/_components/landing-page";
import { useEffect, useState } from "react";
import { auth } from "@/firebase";
import { getPathBoard, getPathPlan } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";
import { UserService } from "@/apis";
import useUserPreferences from "@/components/util/hook/use-local-preference";


enum AuthStatus {
  PROCESSING,
  VALID,
  NOT_VALID,
}

export default function RoutePage() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.PROCESSING)
  const [preferences, _] = useUserPreferences()
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        UserService.getById(authUser.uid).then((user: any) => {
          if (!user) {
            return;
          }

          if (user.teams?.length === 0) {
            router.replace(getPathBoard())
            return
          }

          const teamId = user.teams.includes(preferences.board.selectedTeamId) ? preferences.board.selectedTeamId : user.teams[0]
          router.replace(getPathPlan(teamId))
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
