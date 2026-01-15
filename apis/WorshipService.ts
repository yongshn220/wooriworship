import BaseService from "./BaseService";
import { SongService } from ".";
import { Timestamp, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { Worship } from "@/models/worship";
import { WorshipInput } from "@/components/constants/types";
import { db } from "@/firebase";
import LinkingService from "./LinkingService";
import { parseLocalDate } from "@/components/util/helper/helper-functions";

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

      const q = query(
        collection(db, this.collectionName),
        where('team_id', '==', teamId),
        where('worship_date', '>=', Timestamp.fromDate(startOfDay)),
        where('worship_date', '<', Timestamp.fromDate(nextDay))
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Worship));
    } catch (e) {
      console.error("Failed to fetch worships by date:", e);
      return [];
    }
  }

  async getWorships(teamId: string, startDate: string, endDate: string): Promise<Worship[]> {
    try {
      const startD = parseLocalDate(startDate);
      startD.setHours(0, 0, 0, 0);
      const endD = parseLocalDate(endDate);
      endD.setHours(23, 59, 59, 999);

      // Fetch all for team (Temporary fix for missing Composite Index)
      const q = query(
        collection(db, this.collectionName),
        where('team_id', '==', teamId)
      );
      const snapshot = await getDocs(q);

      const allDocs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Worship));

      // Filter in memory
      const filtered = allDocs.filter(w => {
        if (!w.worship_date) return false;
        // Handle Timestamp or Date (though usually Timestamp in new schema)
        const wDate = w.worship_date instanceof Timestamp ? w.worship_date.toDate() : new Date(w.worship_date as any);
        return wDate >= startD && wDate <= endD;
      });

      return filtered;
    } catch (e) {
      console.error("Failed to fetch worships:", e);
      return [];
    }
  }

  async getPreviousWorships(teamId: string, beforeDate: Date, limitCount: number = 5): Promise<Worship[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('team_id', '==', teamId),
        where('worship_date', '<', Timestamp.fromDate(beforeDate)),
        orderBy('worship_date', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);

      const results = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Worship));

      // Sort ASC (oldest first) so they can be prepended correctly?
      return results.sort((a, b) => a.worship_date.toMillis() - b.worship_date.toMillis());
    } catch (e) {
      console.error("Failed to fetch previous worships:", e);
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
