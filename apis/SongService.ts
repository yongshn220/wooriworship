import {BaseService, StorageService} from ".";
import SongCommentService from "./SongCommentService";
import {Song} from "@/models/song";
import {getAllUrlsFromSongMusicSheets, getFirebaseTimestampNow} from "@/components/helper/helper-functions";
import MusicSheetService from "@/apis/MusicSheetService";
import {MusicSheetContainer} from "@/components/constants/types";
import {SongInput} from "@/app/board/[teamId]/(song)/song-board/_components/song-form/song-form";


class SongService extends BaseService {
  constructor() {
    super("songs");
  }

  async getTeamSong(teamId: string) {
    console.log("SongService.getTeamSong")
    const songs: any = await this.getByFilters([
      {
        a: 'team_id',
        b: '==',
        c: teamId
      }
    ]);
    return songs
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
      return await this.create(newSong);
    }
    catch (e) {
      console.log("err:addNewSong", e)
      return null
    }
  }

  async utilizeSong(songId: string) {
    return await this.update(songId, {last_used_time:new Date()});
  }

  async updateSong(userId: string, songId: string, songInput: SongInput, musicSheetContainers: Array<MusicSheetContainer>) {
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
      return await this.update(songId, song);
    }
    catch (e) {
      console.log(e)
    }
  }

  async deleteSong(songId: string) {
    try {
      const song: Song = await this.getById(songId) as Song;
      if (!song) {
        return true;
      }
      const promises = [];
      const comments = await SongCommentService.getSongComments(song.id, song.team_id);
      for (const comment of comments) {
        promises.push(SongCommentService.delete(comment?.id));
      }

      const musicSheets = await MusicSheetService.getSongMusicSheets(song.id)
      for (const musicSheet of musicSheets) {
        promises.push(MusicSheetService.delete(musicSheet?.id))
      }

      const musicSheetUrls = getAllUrlsFromSongMusicSheets(musicSheets)
      promises.push(StorageService.deleteFileByUrls(musicSheetUrls?? []))
      await Promise.all(promises);
      await this.delete(songId);
      return true;
    } catch (err) {
      console.log("error occured: "+err);
      return false;
    }
  }
}

export default new SongService();
