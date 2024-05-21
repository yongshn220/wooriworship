'use client'
// import {RoutingPage} from "@/app/_components/routing-page";
// import {LandingPage} from "@/app/_components/landing-page";
// import {useEffect, useState} from "react";
// import {auth} from "@/firebase";
// import {getPathBoard} from "@/components/helper/routes";
// import {useRouter} from "next/navigation";
//
// enum AuthStatus {
//   PROCESSING,
//   VALID,
//   NOT_VALID,
// }

export default function Home() {
  // const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.PROCESSING)
  // const router = useRouter()
  //
  // useEffect(() => {
  //   auth.onAuthStateChanged((authUser) => {
  //     if (authUser) {
  //       router.replace(getPathBoard())
  //     }
  //     else {
  //       setAuthStatus(AuthStatus.NOT_VALID)
  //     }
  //   });
  // }, [router]);

  return (
    <div>
      build test
      {/*{*/}
      {/*  authStatus === AuthStatus.NOT_VALID*/}
      {/*    ? <LandingPage/>*/}
      {/*    : <RoutingPage/>*/}
      {/*}*/}
    </div>
  )
}

