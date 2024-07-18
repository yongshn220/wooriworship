import {BaseService} from ".";
import {SongComment} from "@/models/song_comments";
import {Timestamp} from "@firebase/firestore";


class SongCommentService extends BaseService {
  constructor() {
    super("song_comments");
  }

  async getSongComments(songId:string, teamId: string) {
    const songs = await this.getByFilters([
    {
        a: 'song_id',
        b: '==',
        c: songId
    },
    {
        a: 'team_id',
        b: '==',
        c: teamId
    }
    ]);
    return songs
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
    return await this.create(newSongComment);
  }

  async updateSongComment(commentId: string, comment: any) {
    const songComment: any = {
        last_updated_time: Timestamp.fromDate(new Date()),
        comment: comment
    }
    return await this.update(commentId, songComment);
  }

  async deleteSongComment(commentId: string) {
    try {
      await this.delete(commentId);
      return true;
    } catch (err) {
      console.log("error occured: "+err);
      return false;
    }
  }
}

export default new SongCommentService();
