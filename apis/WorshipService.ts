import {BaseService, SongService} from ".";
import {WorshipInfo} from "@/app/board/[teamId]/plan/_components/new-worship-button";
import {Timestamp} from "@firebase/firestore";
import {Worship} from "@/models/worship";

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
    const songIds = worshipInput?.songInfoList.map((songInfo) => songInfo.song.id);
    const promises = [];
    for (const songId of songIds) {
      promises.push(SongService.utilizeSong(songId));
    }
    await Promise.all(promises);
    const newWorship: Worship = {
      team_id: teamId,
      title: worshipInput?.title,
      description: worshipInput?.description,
      songs: worshipInput?.songInfoList.map((songInfo) => ({id: songInfo.song.id, note: songInfo.note})),
      beginning_song_id: worshipInput?.beginningSongId,
      ending_song_id: worshipInput?.endingSongId,
      created_by: {
        id: userId,
        time: Timestamp.fromDate(new Date()),
      },
      updated_by: {
        id: userId,
        time: Timestamp.fromDate(new Date())
      },
      worship_date: Timestamp.fromDate(worshipInput.date)
    }
    return await this.create(newWorship);
  }

  async updateWorship(userId: string, worshipId: string, worshipInput: WorshipInfo) {
    const worship = {
      title: worshipInput?.title,
      description: worshipInput?.description,
      songs: worshipInput?.songInfoList.map((songInfo) => ({id: songInfo.song.id, note: songInfo.note})),
      beginning_song_id: worshipInput?.beginningSongId,
      ending_song_id: worshipInput?.endingSongId,
      updated_by: {
        id: userId,
        time: new Date()
      },
      worship_date: Timestamp.fromDate(worshipInput.date)
    }
    return await this.update(worshipId, worship);
  }

  async deleteWorship(worshipId: string) {
    try {
      await this.delete(worshipId);
      return true;
    }
    catch (err) {
      console.log("error occured: "+err);
      return false;
    }
  }
}

export default new WorshipService();
