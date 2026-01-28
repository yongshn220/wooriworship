// "use client"
//
// import {Session} from "next-auth";
// import {AuthService} from "@/apis";
// import {useEffect} from "react";
// import {useSetRecoilState} from "recoil";
// import {FirebaseSyncStatus, firebaseSyncStatusAtom} from "@/global-states/syncState";
// import {auth} from "@/firebase";
//
//
// async function syncFirebaseAuth(session: Session) {
//   if (session && session.firebaseToken) {
//     const result = await AuthApi.loginWithCustomToken(session.firebaseToken)
//
//     if (result) {
//       console.log("fb sync succ")
//       return true
//     }
//     else {
//       console.log("fb sync fail")
//       return false
//     }
//   }
//   else {
//     console.log("no session")
//     await AuthApi.logout();
//     return false
//   }
// }
//
// export function FirebaseAuthProvider({children}: {children: React.ReactNode}) {
//   const authUser = auth.currentUser
//   const setFirebaseSyncStatus = useSetRecoilState(firebaseSyncStatusAtom)
//
//   useEffect(() => {
//     if (!authUser) return
//
//     setFirebaseSyncStatus(FirebaseSyncStatus.PROCESSING)
//
//     syncFirebaseAuth(authUser).then((isSuccess: boolean) => {
//       if (isSuccess) {
//         setFirebaseSyncStatus(FirebaseSyncStatus.SYNCED)
//       }
//       else {
//         setFirebaseSyncStatus(FirebaseSyncStatus.NOT_SYNCED)
//       }
//     })
//   }, [session, setFirebaseSyncStatus])
//
//   return (
//     <>
//       {children}
//     </>
//   )
// }
