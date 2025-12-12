import BaseService from "./BaseService";
import { InvitationService, UserService } from ".";
import { Team, TeamOption } from "@/models/team";
import { arrayUnion, arrayRemove, Timestamp } from "@firebase/firestore";

class TeamService extends BaseService {
  constructor() {
    super("teams");
  }

  async addNewTeam(userId: string, name: string) {
    const team: Team = {
      name: name,
      create_time: Timestamp.fromDate(new Date()),
      last_worship_time: Timestamp.fromDate(new Date()),
      leaders: [userId],
      users: [userId],
      option: {
        worship: {
          beginning_song: {
            id: null,
            note: "",
            selected_music_sheet_ids: []
          },
          ending_song: {
            id: null,
            note: "",
            selected_music_sheet_ids: []
          }
        }
      }
    }
    return await this.create(team);
  }

  async addNewMember(userId: string, teamId: string) {
    if (userId && teamId) {
      await this.update(teamId, { users: arrayUnion(userId) });
      return teamId;
    } else {
      console.log("there is an error.")
      return null;
    }
  }

  async updateTeamOption(teamId: string, option: TeamOption) {
    return await this.update(teamId, { option: option })
  }

  async removeMember(userId: string, teamId: string, singleSide: Boolean) {
    if (userId && teamId) {
      const promises = [];
      const quiter: any = await UserService.getById(userId);
      if (quiter.email == null) {
        console.log("user email is missing");
        return false;
      }
      promises.push(InvitationService.deleteTeamReceiverInvitations(teamId, quiter.email))
      if (!singleSide) {
        promises.push(UserService.leaveTeam(userId, teamId, true));
      }
      promises.push(this.update(teamId, { users: arrayRemove(userId) }));
      await Promise.all(promises);
      return userId;
    } else {
      console.log("user id or team id is missing");
      return false;
    }
  }

  async deleteTeam(team: Team) {
    const promises = [];
    try {
      const invitations = await InvitationService.getTeamInvitations(team.id);
      for (const invitation of invitations) {
        promises.push(InvitationService.delete(invitation.id));
      }
      for (const user of team.users) {
        promises.push(UserService.leaveTeam(user, team.id, true));
      }
      promises.push(this.delete(team.id));
      await Promise.all(promises);
      return true;
    } catch (e) {
      console.log(e)
      return false;
    }
  }
}

export default new TeamService();
