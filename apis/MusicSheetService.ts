import BaseService from "./BaseService";
import { MusicSheetContainer } from "@/components/constants/types";
import { MusicSheet } from "@/models/music_sheet";
import { getFirebaseTimestampNow } from "@/components/util/helper/helper-functions";


class MusicSheetService extends BaseService {
  constructor() {
    super("music_sheets");
  }

  async getSongMusicSheets(songId: string) {
    try {
      const sheets = await this.getByFilters([{ a: "song_id", b: "==", c: songId }]) as Array<MusicSheet>
      if (!sheets) {
        console.error("err:getSongMusicSheets")
        return []
      }

      return sheets
    }
    catch (e) {
      console.error(e)
      return []
    }
  }

  async addNewMusicSheet(userId: string, songId: string, musicSheetContainer: MusicSheetContainer) {
    try {
      if (!musicSheetContainer) {
        console.error("err:addNewMusicSheet, no music sheet container."); return null;
      }

      const newMusicSheet: MusicSheet = {
        song_id: songId,
        key: musicSheetContainer?.key,
        urls: musicSheetContainer?.imageFileContainers?.map((iContainer) => iContainer?.url),
        created_by: {
          id: userId,
          timestamp: getFirebaseTimestampNow()
        },
        updated_by: {
          id: userId,
          timestamp: getFirebaseTimestampNow()
        }
      }

      return await this.create(newMusicSheet)
    }
    catch (e) {
      console.error(e)
      return null
    }
  }

  async updateMusicSheet(userId: string, songId: string, musicSheetContainer: MusicSheetContainer) {
    try {
      if (!musicSheetContainer?.id) {
        return await this.addNewMusicSheet(userId, songId, musicSheetContainer)
      }

      const data = {
        key: musicSheetContainer?.key,
        urls: musicSheetContainer?.imageFileContainers?.map((iContainer => iContainer.url)),
        updated_by: {
          id: userId,
          timestamp: getFirebaseTimestampNow()
        }
      }
      return await this.update(musicSheetContainer?.id, data)
    }
    catch (e) {
      console.error(e)
      return null
    }
  }

  async addNewMusicSheets(userId: string, songId: string, musicSheetContainers: MusicSheetContainer[]) {
    try {
      const promises = []
      for (const container of musicSheetContainers) {
        promises.push(this.addNewMusicSheet(userId, songId, container))
      }
      await Promise.all(promises)
      return true
    }
    catch (e) {
      console.error(e)
      return false
    }
  }
}

export default new MusicSheetService()
