// import {useRecoilValue, useSetRecoilState} from "recoil";
// import {teamAtom} from "@/global-states/teamState";
// import {useEffect} from "react";
// import {worshipBeginningSongHeaderAtom, worshipEndingSongHeaderAtom} from "@/app/board/[teamId]/plan/_components/status";
//
//
// interface Props {
//   teamId: string
//   children: any
// }
// export function TeamOptionInitializer({teamId, children}: Props) {
//   const team = useRecoilValue(teamAtom(teamId))
//   const setWorshipBeginningSongId = useSetRecoilState(worshipBeginningSongHeaderAtom)
//   const setWorshipEndingSongId = useSetRecoilState(worshipEndingSongHeaderAtom)
//
//   useEffect(() => {
//     if (team?.option?.worship?.beginning_song_id) {
//       setWorshipBeginningSongId(team?.option?.worship?.beginning_song_id)
//     }
//     if (team?.option?.worship?.ending_song_id) {
//       setWorshipEndingSongId(team?.option?.worship?.ending_song_id)
//     }
//
//   }, [setWorshipBeginningSongId, setWorshipEndingSongId, team])
//
//   return (
//     <>
//       {children}
//     </>
//   )
// }
