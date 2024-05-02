import {BaseService} from ".";
import {WorshipInfo} from "@/app/board/_components/worship-plan/new-button";

class WorshipService extends BaseService {
  constructor() {
    super("worships");
  }

  async getTeamWorship(teamId: string) {
    const worships = await this.getByFilters([
      {
        a: 'team_id',
        b: '==',
        c: teamId
      }
    ]);
    return worships
  }

  async addNewWorship(userId: string, teamId: string, worshipInput: WorshipInfo) {
    const newWorship = {
      team_id: teamId,
      title: worshipInput.title,
      description: worshipInput.description,
      songs: worshipInput.songInfoList,
      created_by: {
        id: userId,
        time: new Date(),
      },
      updated_by: {
        id: userId,
        time: new Date()
      },
      worship_date: worshipInput.date
    }
    return await this.create(newWorship);
  }

  async updateWorship(userId: string, worshipId: string, worshipInput: any) {
    const worship = {
        title: worshipInput.title,
        detail: worshipInput.detail,
        songs: worshipInput.songs,
        updated_by: {
          id: userId,
          time: new Date()
        },
        worship_date: worshipInput.worship_date
    }
    return await this.update(worshipId, worship);
  }
}

export default new WorshipService();
