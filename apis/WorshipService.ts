import BaseService from "./BaseService";
import { SongService } from ".";
import { Timestamp } from "@firebase/firestore";
import { Worship } from "@/models/worship";
import { WorshipInput } from "@/components/constants/types";

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

  async addNewWorship(userId: string, teamId: string, worshipInput: WorshipInput) {
    const songIds = worshipInput?.worshipSongHeaders.map((header) => header?.id);
    const promises = [];
    for (const songId of songIds) {
      promises.push(SongService.utilizeSong(songId));
    }
    await Promise.all(promises);
    const newWorship: Worship = {
      team_id: teamId,
      title: worshipInput?.title,
      description: worshipInput?.description,
      link: worshipInput?.link,
      songs: worshipInput?.worshipSongHeaders,
      beginning_song: worshipInput.beginningSong,
      ending_song: worshipInput.endingSong,
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

  async updateWorship(userId: string, worshipId: string, worshipInput: WorshipInput) {
    const worship = {
      title: worshipInput?.title,
      description: worshipInput?.description,
      link: worshipInput?.link,
      songs: worshipInput?.worshipSongHeaders,
      beginning_song: worshipInput.beginningSong,
      ending_song: worshipInput.endingSong,
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
      console.error("error occured: " + err);
      return false;
    }
  }
}

export default new WorshipService();
