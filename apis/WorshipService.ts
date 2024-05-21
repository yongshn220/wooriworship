import {BaseService} from ".";
import {WorshipInfo} from "@/app/board/[teamId]/plan/_components/new-worship-button";
import {Timestamp} from "@firebase/firestore";

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

  //Todo: [Naming changed] Worship.detail -> Worship.description. (please update it for rest of the codes)
  async addNewWorship(userId: string, teamId: string, worshipInput: WorshipInfo) {
    const newWorship = {
      team_id: teamId,
      title: worshipInput.title,
      description: worshipInput.description,
      songs: worshipInput.songInfoList.map((songInfo) => ({id: songInfo.song.id, note: songInfo.note})),
      created_by: {
        id: userId,
        time: new Date(),
      },
      updated_by: {
        id: userId,
        time: new Date()
      },
      worship_date: Timestamp.fromDate(worshipInput.date)
    }
    return await this.create(newWorship);
  }

  async updateWorship(userId: string, worshipId: string, worshipInput: any) {
    const worship = {
        title: worshipInput.title,
        description: worshipInput.description,
        songs: worshipInput.songs,
        updated_by: {
          id: userId,
          time: new Date()
        },
        worship_date: worshipInput.worship_date
    }
    return await this.update(worshipId, worship);
  }

  async deleteWorship(worshipId: string) {
    try{
        await this.delete(worshipId);
        return true;
    } catch (err) {
        console.log("error occured: "+err);
        return false;
    }
  }
}

export default new WorshipService();
