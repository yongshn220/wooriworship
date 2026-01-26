import BaseService from "./BaseService";
import { SongComment } from "@/models/song_comments";
import { db } from "@/firebase";
import { Timestamp, collection, query, orderBy, getDocs, addDoc, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";


class SongCommentService extends BaseService {
  constructor() {
    super("song_comments"); // Placeholder
  }

  async getSongComments(songId: string, teamId: string) {
    try {
      const q = query(
        collection(db, "teams", teamId, "songs", songId, "comments"),
        orderBy("created_by.timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getCommentById(teamId: string, songId: string, commentId: string) {
    try {
      const ref = doc(db, "teams", teamId, "songs", songId, "comments", commentId);
      const docSnap = await getDoc(ref);
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() } as SongComment;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async addNewSongComment(userId: string, teamId: string, songId: string, comment: any) {
    const newSongComment: SongComment = {
      team_id: teamId,
      song_id: songId,
      created_by: {
        id: userId,
        timestamp: Timestamp.fromDate(new Date())
      },
      last_updated_time: Timestamp.fromDate(new Date()),
      comment: comment
    }
    const ref = await addDoc(collection(db, "teams", teamId, "songs", songId, "comments"), newSongComment);
    return ref.id;
  }

  async updateSongComment(teamId: string, songId: string, commentId: string, comment: any) {
    const songComment: any = {
      last_updated_time: Timestamp.fromDate(new Date()),
      comment: comment
    }
    const ref = doc(db, "teams", teamId, "songs", songId, "comments", commentId);
    await setDoc(ref, songComment, { merge: true });
    return true;
  }

  async deleteSongComment(teamId: string, songId: string, commentId: string) {
    try {
      const ref = doc(db, "teams", teamId, "songs", songId, "comments", commentId);
      await deleteDoc(ref);
      return true;
    } catch (err) {
      console.error("error occured: " + err);
      return false;
    }
  }
}

export default new SongCommentService();
