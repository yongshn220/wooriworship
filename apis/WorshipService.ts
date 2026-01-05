import BaseService from "./BaseService";
import { SongService } from ".";
import { Timestamp } from "@firebase/firestore";
import { Worship } from "@/models/worship";
import { WorshipInput } from "@/components/constants/types";
import { firestore } from "@/firebase";
import LinkingService from "./LinkingService";

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

  async getWorshipsByDate(teamId: string, date: Date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const nextDay = new Date(startOfDay);
      nextDay.setDate(nextDay.getDate() + 1);

      const snapshot = await firestore
        .collection(this.collectionName)
        .where('team_id', '==', teamId)
        .where('worship_date', '>=', Timestamp.fromDate(startOfDay))
        .where('worship_date', '<', Timestamp.fromDate(nextDay))
        .get();

      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Worship));
    } catch (e) {
      console.error("Failed to fetch worships by date:", e);
      return [];
    }
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
      service_tags: worshipInput?.service_tags || [],
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
      worship_date: (() => {
        const d = new Date(worshipInput.date);
        d.setHours(12, 0, 0, 0); // Normalize to local noon to avoid edge-shift
        return Timestamp.fromDate(d);
      })(),
      serving_schedule_id: worshipInput.serving_schedule_id || null
    }
    const worshipId = await this.create(newWorship);
    if (worshipId && worshipInput.serving_schedule_id) {
      await LinkingService.linkWorshipAndServing(teamId, worshipId, worshipInput.serving_schedule_id);
    }
    return worshipId;
  }

  async updateWorship(userId: string, worshipId: string, worshipInput: WorshipInput) {
    const worship = {
      title: worshipInput?.title,
      description: worshipInput?.description,
      link: worshipInput?.link,
      service_tags: worshipInput?.service_tags || [],
      songs: worshipInput?.worshipSongHeaders,
      beginning_song: worshipInput.beginningSong,
      ending_song: worshipInput.endingSong,
      updated_by: {
        id: userId,
        time: new Date()
      },
      worship_date: (() => {
        const d = new Date(worshipInput.date);
        d.setHours(12, 0, 0, 0);
        return Timestamp.fromDate(d);
      })()
    }
    return await this.update(worshipId, worship);
  }

  async deleteWorship(worshipId: string) {
    try {
      const worship = (await this.getById(worshipId)) as Worship;
      if (worship && worship.team_id) {
        await LinkingService.cleanupReferencesForWorshipDeletion(worship.team_id, worshipId);
      }
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
