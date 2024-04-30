import {BaseService} from ".";
import { MusicSheet, SongInput } from "@/app/board/[teamId]/song/_components/song-form";

class SongService extends BaseService {
  constructor() {
    super("songs");
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

  async addNewSong(userId: string, teamId: string, songInput: any) {
    const newSong = {
      team_id: teamId,
      title: songInput.title,
      original: {
        author: songInput.author,
        url: songInput.link
      },
      version: songInput.version,
      key: songInput.key,
      description: songInput.description,
      lyrics: "",
      bpm: songInput.bpm,
      tags: songInput.tags,
      created_by: {
        id: userId,
        time: new Date(),
      },
      updated_by: {
        id: userId,
        time: new Date()
      },
      last_used_time: new Date(),
      music_sheet_urls: songInput.music_sheet_urls,
    }
    return await this.create(newSong);
  }

  async updateSong(userId: string, songId: string, songInput: any) {
    const song = {
      title: songInput.title,
      original: {
        author: songInput.author,
        url: songInput.link
      },
      version: songInput.version,
      description: songInput.description,
      lyrics: "",
      bpm: songInput.bpm,
      tags: songInput.tags,
      updated_by: {
        id: userId,
        time: new Date()
      },
      key: songInput.key,
      music_sheet_urls: songInput.music_sheet_urls
    }
    return await this.update(songId, song);
  }
}

export default new SongService();
