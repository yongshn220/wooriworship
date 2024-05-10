'use client'
import {RootAuthenticate} from "@/app/_components/auth/root-authenticate";
import {RoutingPage} from "@/app/_components/routing-page";
import {useRecoilValue} from "recoil";
import {FirebaseSyncStatus, firebaseSyncStatusAtom} from "@/global-states/syncState";
import {LandingPage} from "@/app/_components/landing-page";


export default function Home() {
  const firebaseSyncStatus = useRecoilValue(firebaseSyncStatusAtom)
  return (
    <RootAuthenticate>
      {
        firebaseSyncStatus === FirebaseSyncStatus.NOT_SYNCED
        ?  <LandingPage/>
        :  <RoutingPage/>
      }
    </RootAuthenticate>
  )
}

