import {BaseService} from ".";
import {Song} from "@/models/song";
import {SongInput} from "@/app/board/[teamId]/song/_components/new-button";

class SongService extends BaseService {
  constructor() {
    super("songs");
  }

  async addNewSong(userId: string, team_id: string, songInput: SongInput) {
    const newSong = {
      team_id: team_id,
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
      created_by: {
        id: userId,
        time: new Date(),
      },
      updated_by: {
        id: userId,
        time: new Date(),
      },
      last_used_time: new Date(),
      storage_location: [],
    }
    return await this.create(newSong);
  }
}

export default new SongService();
