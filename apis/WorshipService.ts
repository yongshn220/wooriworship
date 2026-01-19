import BaseService from "./BaseService";
import { SongService } from ".";
import { Timestamp, collection, getDocs, getDoc, query, where, orderBy, limit, addDoc, doc, setDoc, deleteDoc, collectionGroup, documentId } from "firebase/firestore";
import { Worship } from "@/models/worship";
import { WorshipInput } from "@/components/constants/types";
import { db } from "@/firebase";
import LinkingService from "./LinkingService";
import { parseLocalDate } from "@/components/util/helper/helper-functions";

class WorshipService extends BaseService {
  constructor() {
    super("worships"); // Placeholder
  }

  // Override getById to find doc in sub-collections
  async getById(teamId: string, id: string) {
    if (!teamId || !id) return null;
    try {
      const docRef = doc(db, "teams", teamId, "worships", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return { id: docSnap.id, ...docSnap.data() };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getTeamWorship(teamId: string) {
    try {
      const snapshot = await getDocs(collection(db, "teams", teamId, "worships"));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getWorshipsByDate(teamId: string, date: Date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const nextDay = new Date(startOfDay);
      nextDay.setDate(nextDay.getDate() + 1);

      const q = query(
        collection(db, "teams", teamId, "worships"),
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

      const q = query(
        collection(db, "teams", teamId, "worships"),
        where('worship_date', '>=', Timestamp.fromDate(startD)),
        where('worship_date', '<=', Timestamp.fromDate(endD))
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Worship));
    } catch (e) {
      console.error("Failed to fetch worships:", e);
      return [];
    }
  }

  async getPreviousWorships(teamId: string, beforeDate: Date, limitCount: number = 5): Promise<Worship[]> {
    try {
      const q = query(
        collection(db, "teams", teamId, "worships"),
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
      promises.push(SongService.utilizeSong(teamId, songId)); // Updated signature
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
        d.setHours(12, 0, 0, 0); // Normalize to local noon
        return Timestamp.fromDate(d);
      })(),
      serving_schedule_id: worshipInput.serving_schedule_id || null
    }

    // Sub-collection creation
    try {
      const ref = await addDoc(collection(db, "teams", teamId, "worships"), newWorship);
      const worshipId = ref.id;

      if (worshipId && worshipInput.serving_schedule_id) {
        await LinkingService.linkWorshipAndServing(teamId, worshipId, worshipInput.serving_schedule_id);
      }
      return worshipId;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async updateWorship(userId: string, teamId: string, worshipId: string, worshipInput: WorshipInput) {
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

    try {
      const ref = doc(db, "teams", teamId, "worships", worshipId);
      await setDoc(ref, worship, { merge: true });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async deleteWorship(teamId: string, worshipId: string) {
    try {
      // Fetch logic usually needed to confirm existence or get data for cleanup, 
      // but LinkingService cleanup uses ID. 
      // We can fetch to get team_id but we have strict teamId param now.

      await LinkingService.cleanupReferencesForWorshipDeletion(teamId, worshipId);

      const ref = doc(db, "teams", teamId, "worships", worshipId);
      await deleteDoc(ref);
      return true;
    }
    catch (err) {
      console.error("error occured: " + err);
      return false;
    }
  }
}

export default new WorshipService();
