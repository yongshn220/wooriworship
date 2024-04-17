import {BaseService} from ".";

class TagService extends BaseService {
  constructor() {
    super("tags");
  }

  async getTeamTags(teamId: string) {
    const songs = await this.getByFilters([
      {
        a: 'team_id',
        b: '==',
        c: teamId
      }
    ]);
    return songs
  }

  async addNewTag(teamId: string, tagName: string) {
    const newTag = {
        team_id: teamId,
        name: tagName
    }
    return await this.create(newTag);
  }
}

export default new TagService();
