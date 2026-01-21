import BaseService from "./BaseService";
import { MusicSheetContainer } from "@/components/constants/types";
import { MusicSheet } from "@/models/music_sheet";
import { getFirebaseTimestampNow } from "@/components/util/helper/helper-functions";
import { db as defaultDb } from "@/firebase";
import { collection, getDocs, getDoc, addDoc, doc, setDoc, deleteDoc, Firestore } from "firebase/firestore";

class MusicSheetService extends BaseService {
  private static instance: MusicSheetService;
  protected db: Firestore;

  private constructor(db?: Firestore) {
    super("music_sheets"); // Placeholder
    this.db = db || defaultDb;
  }

  public static getInstance(db?: Firestore): MusicSheetService {
    if (!MusicSheetService.instance) {
      MusicSheetService.instance = new MusicSheetService(db);
    }
    return MusicSheetService.instance;
  }

  async getSongMusicSheets(teamId: string, songId: string) {
    try {
      const sheetsRef = collection(this.db, "teams", teamId, "songs", songId, "sheets");
      const snapshot = await getDocs(sheetsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MusicSheet));
    }
    catch (e) {
      console.error("DEBUG_ERROR:", e)
      return []
    }
  }

  async getById(teamId: string, songId: string, sheetId: string) {
    try {
      const ref = doc(this.db, "teams", teamId, "songs", songId, "sheets", sheetId);
      const docSnap = await getDoc(ref);
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() } as MusicSheet;
    } catch (e) {
      console.error("DEBUG_ERROR:", e);
      return null;
    }
  }

  async addNewMusicSheet(userId: string, teamId: string, songId: string, musicSheetContainer: MusicSheetContainer) {
    try {
      if (!musicSheetContainer) {
        console.error("err:addNewMusicSheet, no music sheet container."); return null;
      }

      const newMusicSheet: MusicSheet = {
        song_id: songId,
        key: musicSheetContainer?.key,
        urls: musicSheetContainer?.imageFileContainers?.map((iContainer) => iContainer?.url),
        created_by: {
          id: userId,
          timestamp: getFirebaseTimestampNow()
        },
        updated_by: {
          id: userId,
          timestamp: getFirebaseTimestampNow()
        }
      }

      const ref = await addDoc(collection(this.db, "teams", teamId, "songs", songId, "sheets"), newMusicSheet);
      return ref.id;
    }
    catch (e) {
      console.error("DEBUG_ERROR:", e)
      return null
    }
  }

  async updateMusicSheet(userId: string, teamId: string, songId: string, musicSheetContainer: MusicSheetContainer) {
    try {
      if (!musicSheetContainer?.id) {
        return await this.addNewMusicSheet(userId, teamId, songId, musicSheetContainer)
      }

      const data = {
        key: musicSheetContainer?.key,
        urls: musicSheetContainer?.imageFileContainers?.map((iContainer => iContainer.url)),
        updated_by: {
          id: userId,
          timestamp: getFirebaseTimestampNow()
        }
      }
      const ref = doc(this.db, "teams", teamId, "songs", songId, "sheets", musicSheetContainer.id);
      await setDoc(ref, data, { merge: true });
      return true;
    }
    catch (e) {
      console.error("DEBUG_ERROR:", e)
      return null
    }
  }

  async deleteMusicSheet(teamId: string, songId: string, sheetId: string) {
    try {
      const ref = doc(this.db, "teams", teamId, "songs", songId, "sheets", sheetId);
      await deleteDoc(ref);
      return true;
    } catch (e) {
      console.error("DEBUG_ERROR:", e);
      return false;
    }
  }

  async addNewMusicSheets(userId: string, teamId: string, songId: string, musicSheetContainers: MusicSheetContainer[]) {
    try {
      const promises = []
      for (const container of musicSheetContainers) {
        promises.push(this.addNewMusicSheet(userId, teamId, songId, container))
      }
      await Promise.all(promises)
      return true
    }
    catch (e) {
      console.error(e)
      return false
    }
  }
}

export default MusicSheetService.getInstance()
