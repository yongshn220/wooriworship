import {BaseService} from ".";

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

  async addNewWorship(userId: string, teamId: string, worshipInput: any) {
    const newWorship = {
      team_id: teamId,
      title: worshipInput.title,
      detail: worshipInput.detail,
      songs: worshipInput.songs,
      created_by: {
        id: userId,
        time: new Date(),
      },
      updated_by: {
        id: userId,
        time: new Date()
      },
      worship_date: worshipInput.worship_date
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
