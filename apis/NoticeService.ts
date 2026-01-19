import BaseService from "./BaseService";
import { StorageService } from ".";
import { db } from "@/firebase";
import { collection, query, orderBy, getDocs, addDoc, doc, setDoc, getDoc, deleteDoc, collectionGroup, where, documentId, limit } from "firebase/firestore";

class NoticeService extends BaseService {
  constructor() {
    super("notices"); // Placeholder
  }

  // Override getById to find doc in sub-collections (teams/{teamId}/notices)
  async getById(teamId: string, id: string) {
    try {
      const docRef = doc(db, "teams", teamId, "notices", id);
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

  async getTeamNotices(teamId: string) {
    // New Path: teams/{teamId}/notices
    try {
      const q = query(
        collection(db, "teams", teamId, "notices"),
        orderBy("last_updated_time", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async addNewNotice(userId: string, teamId: string, noticeInput: any) {
    const newNotice = {
      team_id: teamId,
      title: noticeInput.title,
      created_by: {
        id: userId,
        time: new Date(),
      },
      body: noticeInput.body,
      last_updated_time: new Date(),
      file_urls: noticeInput.file_urls,
    }
    // Use sub-collection
    return await this.createInTeam(teamId, newNotice);
  }

  async updateNotice(teamId: string, noticeId: string, noticeInput: any) {
    const notice: any = {
      title: noticeInput.title,
      body: noticeInput.body,
      last_updated_time: new Date(),
    }
    if (noticeInput.file_urls) {
      notice.file_urls = noticeInput.file_urls
    }
    // Use sub-collection
    return await this.updateInTeam(teamId, noticeId, notice);
  }

  async deleteNotice(teamId: string, noticeId: string) {
    try {
      // Need to fetch file_urls first?
      // But BaseService.getById is for root collection... 
      // We need a getByIdInTeam.

      const noticeRef = doc(db, "teams", teamId, "notices", noticeId);
      const noticeSnap = await getDoc(noticeRef);
      const notice = noticeSnap.data();

      if (!notice) {
        return true;
      }
      await StorageService.deleteNoticeFiles(notice.file_urls ? notice.file_urls : []);
      await deleteDoc(noticeRef);
      return true;
    } catch (err) {
      console.log("error occured: " + err);
      return false;
    }
  }

  // Helper Wrappers for Base Operations in Sub-collection
  async createInTeam(teamId: string, data: any) {
    const ref = await addDoc(collection(db, "teams", teamId, "notices"), data);
    return ref.id;
  }

  async updateInTeam(teamId: string, noticeId: string, data: any) {
    try {
      const ref = doc(db, "teams", teamId, "notices", noticeId);
      await setDoc(ref, data, { merge: true });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

export default new NoticeService();
