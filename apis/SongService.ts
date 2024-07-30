import {BaseService, StorageService} from ".";
import SongCommentService from "./SongCommentService";
import {SongFormParam} from "@/app/board/[teamId]/song/_components/song-form";
import {Song} from "@/models/song";
import {getAllUrlsFromSongMusicSheets, getFirebaseTimestampNow} from "@/components/helper/helper-functions";


class SongService extends BaseService {
  constructor() {
    super("songs_m");
  }

  async getTeamSong(teamId: string) {
    console.log("SongService.getTeamSong")
    const songs = await this.getByFilters([
      {
        a: 'team_id',
        b: '==',
        c: teamId
      }
    ]);
    return songs
  }

  async addNewSong(userId: string, teamId: string, songFormParam: SongFormParam) {
    try {
      const music_sheets = songFormParam?.musicSheetContainers?.map((mContainer) => ({key: mContainer.key, urls: mContainer.imageFileContainers.map(iContainer => iContainer.url)}))
      const newSong: Song = {
        team_id: teamId,
        title: songFormParam.title,
        subtitle: songFormParam.subtitle,
        original: {
          author: songFormParam.author,
          url: songFormParam.link
        },
        version: songFormParam.version,
        description: songFormParam.description,
        lyrics: "",
        bpm: songFormParam.bpm,
        tags: songFormParam.tags,
        created_by: {
          id: userId,
          time: getFirebaseTimestampNow(),
        },
        updated_by: {
          id: userId,
          time: getFirebaseTimestampNow()
        },
        last_used_time: getFirebaseTimestampNow(),
        music_sheets: music_sheets,
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

  async updateSong(userId: string, songId: string, songFormParam: SongFormParam) {
    try {
      const music_sheets = songFormParam?.musicSheetContainers?.map((mContainer) => ({key: mContainer.key, urls: mContainer.imageFileContainers.map(iContainer => iContainer.url)}))
      const song = {
        title: songFormParam.title,
        subtitle: songFormParam.subtitle,
        original: {
          author: songFormParam.author,
          url: songFormParam.link
        },
        version: songFormParam.version,
        description: songFormParam.description,
        lyrics: "",
        bpm: songFormParam.bpm,
        tags: songFormParam.tags,
        updated_by: {
          id: userId,
          time: getFirebaseTimestampNow()
        },
        music_sheets: music_sheets
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
        promises.push(SongCommentService.delete(comment.id));
      }
      const songUrls = getAllUrlsFromSongMusicSheets(song?.music_sheets)
      promises.push(StorageService.deleteFileByUrls(songUrls?? []))
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
