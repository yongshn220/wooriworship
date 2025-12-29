import BaseService from "./BaseService";

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

  async addNewTags(teamId: string, tagNames: Array<string>) {
    const updates = [];
    for (let tagName of tagNames) {
      updates.push(this.addNewTag(teamId, tagName));
    }
    try {
      await Promise.all(updates);
      return true
    } catch (err) {
      console.error('Error occured: ' + err);
      return false
    }
  }
  async deleteTag(teamId: string, tagName: string) {
    return await this.delete(`${teamId}-스플릿-${tagName}`);
  }
}

export default new TagService();
