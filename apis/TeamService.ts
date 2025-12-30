import BaseService from "./BaseService";
import { InvitationService, UserService } from ".";
import { Team, TeamOption } from "@/models/team";
import { arrayUnion, arrayRemove, Timestamp } from "@firebase/firestore";
import ServingService from "./ServingService";

class TeamService extends BaseService {
  constructor() {
    super("teams");
  }

  async addNewTeam(userId: string, name: string) {
    const team: Team = {
      name: name,
      create_time: Timestamp.fromDate(new Date()),
      last_worship_time: Timestamp.fromDate(new Date()),
      admins: [userId],
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
      },
      service_tags: []
    }
    const teamId = await this.create(team);
    if (teamId) {
      // Init Serving defaults
      await ServingService.initStandardRoles(teamId);
      await ServingService.initDefaultTemplate(teamId);
    }
    return teamId;
  }

  async addNewMember(userId: string, teamId: string) {
    if (userId && teamId) {
      await this.update(teamId, { users: arrayUnion(userId) });
      return teamId;
    } else {
      console.error("there is an error.")
      return null;
    }
  }

  async updateTeamOption(teamId: string, option: TeamOption) {
    return await this.update(teamId, { option: option })
  }

  async addAdmin(teamId: string, userId: string) {
    return await this.update(teamId, { admins: arrayUnion(userId) });
  }

  async updateServiceTags(teamId: string, tags: Array<{ id: string, name: string, order: number }>) {
    return await this.update(teamId, { service_tags: tags });
  }

  async addServiceTag(teamId: string, tagName: string) {
    const team = (await this.getById(teamId)) as Team;
    if (!team) return null;

    const existingTag = team.service_tags?.find((t: any) => t.name === tagName);
    if (existingTag) return existingTag.id;

    const newTag = {
      id: Math.random().toString(36).substr(2, 9),
      name: tagName,
      order: (team.service_tags?.length || 0)
    };

    await this.update(teamId, {
      service_tags: [...(team.service_tags || []), newTag]
    });
    return newTag.id;
  }

  async removeAdmin(teamId: string, userId: string) {
    return await this.update(teamId, { admins: arrayRemove(userId) });
  }

  async removeMember(userId: string, teamId: string, singleSide: Boolean) {
    if (userId && teamId) {
      const promises = [];
      const quiter: any = await UserService.getById(userId);
      if (quiter.email == null) {
        console.error("user email is missing");
        return false;
      }
      promises.push(InvitationService.deleteTeamReceiverInvitations(teamId, quiter.email))
      if (!singleSide) {
        promises.push(UserService.leaveTeam(userId, teamId, true));
      }
      promises.push(ServingService.cleanupMember(teamId, userId));
      promises.push(this.update(teamId, { users: arrayRemove(userId) }));
      await Promise.all(promises);
      return userId;
    } else {
      console.error("user id or team id is missing");
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
      console.error(e)
      return false;
    }
  }
}

export default new TeamService();
