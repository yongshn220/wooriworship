// 'use client'
//
// import {ResetType} from "@/components/constants/enums";
// import {useRecoilCallback} from "recoil";
// import {resetCurrentTeamWorshipIdsState,} from "@/global-states/worship-state";
// import {resetCurrentTeamIdState} from "@/global-states/teamState";
//
//
// export default function useCustomResetRecoilState(resetType: ResetType) {
//   return useRecoilCallback(({set}) => () => {
//     resetCurrentTeamWorshipIdsState(set)
//     resetCurrentTeamIdState(set)
//   }, [])
// }
