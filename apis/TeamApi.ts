import BaseApi from "./BaseApi";
import { InvitationApi, UserApi } from ".";
import { Team, TeamOption } from "@/models/team";
import { arrayUnion, arrayRemove, Timestamp } from "firebase/firestore";
import { PraiseTeamApi } from "./PraiseTeamApi";
import { ServiceFlowApi } from "./ServiceFlowApi";

class TeamApi extends BaseApi {
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
        setlist: {
          beginning_song: {
            id: null as any,
            note: "",
            selected_music_sheet_ids: []
          },
          ending_song: {
            id: null as any,
            note: "",
            selected_music_sheet_ids: []
          }
        }
      },
      service_tags: []
    }
    const teamId = await this.create(team);
    if (teamId) {
      // Init Serving defaults (V3)
      await PraiseTeamApi.initStandardRoles(teamId);
      await ServiceFlowApi.initDefaultTemplate(teamId);
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
    const promises = tags.map(tag =>
      this.updateChild(teamId, "service_tags", tag.id, {
        name: tag.name,
        order: tag.order
      })
    );
    return await Promise.all(promises);
  }

  async getServiceTags(teamId: string) {
    try {
      const snap = await this.getChildren(teamId, "service_tags");
      return (snap || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async addServiceTag(teamId: string, tagName: string) {
    const team = (await this.getById(teamId)) as Team;
    if (!team) return null;

    const existingTags = await this.getServiceTags(teamId);
    const existingTag = existingTags.find((t: any) => t.name === tagName);
    if (existingTag) return existingTag.id;

    const newTagId = tagName;
    const newTag = {
      id: newTagId,
      name: tagName,
      order: existingTags.length,
      created_at: Timestamp.now()
    };

    await this.addChild(teamId, "service_tags", newTagId, newTag);
    return newTagId;
  }

  async deleteServiceTag(teamId: string, tagId: string) {
    return await this.deleteChild(teamId, "service_tags", tagId);
  }

  async updateServiceTagName(teamId: string, tagId: string, newName: string) {
    // If ID is Name, we must delete and recreate
    const existingTags = await this.getServiceTags(teamId);
    const tag = existingTags.find((t: any) => t.id === tagId) as any;
    if (!tag) return;

    await this.deleteServiceTag(teamId, tagId);
    return await this.addChild(teamId, "service_tags", newName, {
      id: newName,
      name: newName,
      order: tag.order ?? 0,
      created_at: tag.created_at || Timestamp.now()
    });
  }

  async removeAdmin(teamId: string, userId: string) {
    return await this.update(teamId, { admins: arrayRemove(userId) });
  }

  async removeMember(userId: string, teamId: string, singleSide: Boolean) {
    if (userId && teamId) {
      const promises = [];
      const quiter: any = await UserApi.getById(userId);
      if (quiter.email == null) {
        console.error("user email is missing");
        return false;
      }
      promises.push(InvitationApi.deleteTeamReceiverInvitations(teamId, quiter.email))
      if (!singleSide) {
        promises.push(UserApi.leaveTeam(userId, teamId, true));
      }
      promises.push(PraiseTeamApi.cleanupMember(teamId, userId));
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
      const invitations = await InvitationApi.getTeamInvitations(team.id);
      for (const invitation of invitations) {
        promises.push(InvitationApi.delete(invitation.id));
      }
      for (const user of team.users) {
        promises.push(UserApi.leaveTeam(user, team.id, true));
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

export default new TeamApi();
