import {signal} from "@preact/signals-react";
import {Team} from "@/models/team";
import {TeamItem} from "@/app/board/_components/sidebar/team-item";



const teamList = signal<Array<Team>>([{name: "GVC Friday"}])

export function TeamList() {

  return (
    <ul>
      {
        teamList.value.map((team: Team, i: number) => (
          <TeamItem key={i} name={team.name}/>
        ))
      }
    </ul>
  )
}
