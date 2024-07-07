import {BaseService, StorageService} from ".";


class NoticeService extends BaseService {
  constructor() {
    super("notices");
  }

  async getTeamNotices(teamId: string) {
    const notices = await this.getByFilters([
      {
        a: 'team_id',
        b: '==',
        c: teamId
      }
    ]);
    return notices
  }

  async addNewNotice(userId: string, teamId: string, noticeInput: any) {
    const newNotice = {
      team_id: teamId,
      title: noticeInput.title,
      created_by: {
        id: userId,
        time: new Date(),
      },
      body: noticeInput.body,
      last_updated_time: new Date(),
      file_urls: noticeInput.file_urls,
    }
    return await this.create(newNotice);
  }

  async updateNotice(noticeId: string, noticeInput: any) {
    const notice: any = {
        title: noticeInput.title,
        body: noticeInput.body,
        last_updated_time: new Date(),
    }
    if (noticeInput.file_urls) {
        notice.file_urls = noticeInput.file_urls
    }
    return await this.update(noticeId, notice);
  }

  async deleteNotice(noticeId: string) {
    try {
      const notice:any = await this.getById(noticeId);
      if (!notice) {
        return true;
      }
      await StorageService.deleteNoticeFiles(notice.file_urls ? notice.file_urls : []);
      await this.delete(noticeId);
      return true;
    } catch (err) {
      console.log("error occured: "+err);
      return false;
    }
  }
}

export default new NoticeService();
