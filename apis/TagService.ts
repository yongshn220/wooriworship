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
    return await this.update(`${teamId}-스플릿-${tagName}`, newTag);
  }

  async addNewTags(teamId:string, tagNames: Array<string>) {
    const updates = [];
    for(let tagName of tagNames) {
      updates.push(this.addNewTag(teamId, tagName));
    }
    try {
      await Promise.all(updates);
      console.log('Tag Upload finished');
      return true
    } catch (err) {
      console.error('Error occured: '+err);
      return false
    }
  }
}

export default new TagService();
