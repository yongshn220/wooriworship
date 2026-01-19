import BaseService from "./BaseService";
import { StorageService } from ".";
import SongCommentService from "./SongCommentService";
import { Song } from "@/models/song";
import { getAllUrlsFromSongMusicSheets, getFirebaseTimestampNow } from "@/components/util/helper/helper-functions";
import MusicSheetService from "@/apis/MusicSheetService";
import { MusicSheetContainer } from "@/components/constants/types";
import { SongInput } from "@/components/elements/design/song/song-form/song-form";
import { db } from "@/firebase";
import { collection, query, orderBy, getDocs, addDoc, doc, setDoc, deleteDoc, getDoc, collectionGroup, where, limit, documentId } from "firebase/firestore"; class SongService extends BaseService {
  constructor() {
    super("songs"); // Placeholder
  }

  // Override getById
  async getById(teamId: string, id: string) {
    try {
      const docRef = doc(db, "teams", teamId, "songs", id);
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

  async getSong(teamId: string) {
    try {
      const snapshot = await getDocs(collection(db, "teams", teamId, "songs"));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getSongIds(teamId: string) {
    try {
      const snapshot = await getDocs(collection(db, "teams", teamId, "songs"));
      return snapshot.docs.map(doc => doc.id);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getSongHeader(teamId: string) {
    // Optimization: In client SDK we can't select fields easily without fetching full docs,
    // unless we use specific indexes or just fetch all.
    // For now, fetch all.
    try {
      const q = query(collection(db, "teams", teamId, "songs"), orderBy("title"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          team_id: data.team_id,
          title: data.title,
          subtitle: data.subtitle,
          keys: data.keys,
          original: data.original,
          tags: data.tags,
          version: data.version,
          last_used_time: data.last_used_time
        };
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async addNewSong(userId: string, teamId: string, songInput: SongInput, musicSheetContainers: Array<MusicSheetContainer>) {
    try {
      const newSong: Song = {
        team_id: teamId,
        title: songInput.title,
        subtitle: songInput.subtitle,
        original: {
          author: songInput.author,
          url: songInput.link
        },
        version: songInput.version,
        description: songInput.description,
        lyrics: "",
        keys: musicSheetContainers?.map(mContainer => mContainer?.key),
        bpm: songInput.bpm,
        tags: songInput.tags,
        created_by: {
          id: userId,
          time: getFirebaseTimestampNow(),
        },
        updated_by: {
          id: userId,
          time: getFirebaseTimestampNow()
        },
        last_used_time: getFirebaseTimestampNow(),
      }

      const ref = await addDoc(collection(db, "teams", teamId, "songs"), newSong);
      return ref.id;
    }
    catch (e) {
      console.error("err:addNewSong", e)
      return null
    }
  }

  async utilizeSong(teamId: string, songId: string) {
    try {
      const ref = doc(db, "teams", teamId, "songs", songId);
      await setDoc(ref, { last_used_time: new Date() }, { merge: true });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async updateSong(userId: string, teamId: string, songId: string, songInput: SongInput, musicSheetContainers: Array<MusicSheetContainer>) {
    try {
      const song = {
        title: songInput.title,
        subtitle: songInput.subtitle,
        original: {
          author: songInput.author,
          url: songInput.link
        },
        version: songInput.version,
        description: songInput.description,
        lyrics: "",
        keys: musicSheetContainers?.map(mContainer => mContainer?.key),
        bpm: songInput.bpm,
        tags: songInput.tags,
        updated_by: {
          id: userId,
          time: getFirebaseTimestampNow()
        },
      }
      const ref = doc(db, "teams", teamId, "songs", songId);
      await setDoc(ref, song, { merge: true });
      return true;
    }
    catch (e) {
      console.error(e)
      return false;
    }
  }

  async deleteSong(teamId: string, songId: string) {
    try {
      // Need to fetch full song first to get sub-items logic?
      // Actually we know the IDs of subitems usually by iterating.

      const songRef = doc(db, "teams", teamId, "songs", songId);
      const songSnap = await getDoc(songRef);
      if (!songSnap.exists()) return true;

      const song = { id: songSnap.id, ...songSnap.data() } as Song;

      const promises = [];
      const comments = await SongCommentService.getSongComments(song.id, teamId);
      for (const comment of comments) {
        promises.push(SongCommentService.deleteSongComment(teamId, song.id, comment?.id));
      }

      const musicSheets = await MusicSheetService.getSongMusicSheets(teamId, song.id)
      for (const musicSheet of musicSheets) {
        promises.push(MusicSheetService.deleteMusicSheet(teamId, song.id, musicSheet?.id))
      }

      const musicSheetUrls = getAllUrlsFromSongMusicSheets(musicSheets)
      promises.push(StorageService.deleteFileByUrls(musicSheetUrls ?? []))
      await Promise.all(promises);

      await deleteDoc(songRef);
      return true;
    } catch (err) {
      console.error("error occured: " + err);
      return false;
    }
  }
}

export default new SongService();
