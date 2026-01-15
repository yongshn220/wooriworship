import { storage } from "@/firebase"
import { deleteObject, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ImageFileContainer, MusicSheetContainer } from "@/components/constants/types";

class StorageService {
  constructor() {
  }

  async refTest(url: string) {
    const refer = ref(storage, url)
    return refer.fullPath;
  }

  async uploadFile(folder_name: string, file: File, prefix: string = "") {
    if (!file) return null

    try {
      const fileName = (prefix) ? `${prefix}-스플릿-${file?.name}` : file?.name
      const fileRef = ref(storage, `${folder_name}/${fileName}`);
      await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef)
    }
    catch (e) {
      console.error(e)
      return null
    }
  }

  async uploadFiles(folder_name: string, files: Array<File>, prefixes?: Array<String> | null) {
    let uploads: Array<Promise<string>> = [];
    try {
      for (const i in files) {
        if (files[i] == null) {
          continue; // Changed to continue to not break loop entirely if one is null but handle generally
        }
        let fileName = files[i]?.name;
        if (prefixes) {
          fileName = `${prefixes[i]}-스플릿-${fileName}`
        }
        const fileRef = ref(storage, `${folder_name}/${fileName}`);
        uploads.push(
          uploadBytes(fileRef, files[i]).then(snapshot => getDownloadURL(snapshot.ref))
        );
      }
      const urls = await Promise.all(uploads);
      console.log("multiple files have been uploaded");
      return urls;
    } catch (err) {
      console.error("Error uploading file:", err);
      return [];
    }
  }

  async downloadFile(fileUrl: string) {
    const fileRef = ref(storage, fileUrl);
    try {
      const downloadUrl = await getDownloadURL(fileRef);
      return downloadUrl;
    } catch (err) {
      console.error("Error getting download url: " + err);
    }
  }

  async deleteFile(fileUrl: string) {
    const fileRef = ref(storage, fileUrl);
    try {
      await deleteObject(fileRef);
      return true;
    } catch (err) {
      console.error("Delete failed: " + err);
      return false;
    }
  }

  async downloadMusicSheet(team_id: string, song_id: string, sheet_name: string) {
    return await this.downloadFile(`${team_id}/${song_id}-스플릿-${sheet_name}`);
  }

  async uploadNoticeFiles(team_id: string, files: Array<ImageFileContainer>) {
    return await this.uploadMusicSheets(team_id, files);
  }

  async uploadMusicSheetContainer(team_id: string, musicSheetContainer: MusicSheetContainer) {
    if (!musicSheetContainer || musicSheetContainer.imageFileContainers.length === 0) return null

    try {
      const newMusicSheetContainer = { ...musicSheetContainer }
      for (const imageFileContainer of newMusicSheetContainer.imageFileContainers) {
        if (!imageFileContainer.file) {
          console.error("uploadMusicSheetContainer: file not exists."); continue
        }
        if (imageFileContainer.isUploadedInDatabase === true) {
          console.error("uploadMusicSheetContainer: file already exists in database."); continue
        }

        const downloadUrl = await this.uploadFile(team_id, imageFileContainer.file, imageFileContainer.id)
        if (!downloadUrl) {
          console.error("uploadMusicSheetContainer: fail to get download url."); continue
        }
        imageFileContainer.isUploadedInDatabase = true
        imageFileContainer.url = downloadUrl
      }
      return newMusicSheetContainer
    }
    catch (e) {
      console.error(e)
      return null
    }
  }

  async uploadMusicSheets(team_id: string, musicSheets: Array<ImageFileContainer>) {
    const files = musicSheets.map((ms) => {
      return ms.file
    })
    const ids = musicSheets.map((ms) => {
      return ms.id
    })
    return await this.uploadFiles(team_id, files, ids)
  }

  async deleteNoticeFiles(urls: Array<string>) {
    return await this.deleteFileByUrls(urls);
  }

  async deleteFileByUrls(urls: Array<string>) {
    const promises = [];
    try {
      for (let url of urls) {
        const sheetRef = ref(storage, url)
        promises.push(deleteObject(sheetRef));
      }
      await Promise.all(promises);
      return true;
    } catch (err) {
      return false;
    }
  }

  async updateNoticeFiles(teamId: string, new_files: Array<ImageFileContainer>, delete_files: Array<string>) {
    return await this.updateMusicSheets(teamId, new_files, delete_files);
  }

  async updateMusicSheets(teamId: string, new_sheets: Array<ImageFileContainer>, delete_sheets: Array<string>) {
    try {
      await this.deleteFileByUrls(delete_sheets);
      if (new_sheets.length === 0) {
        return [];
      }
      const files = new_sheets.map((ms) => {
        return ms.file
      })
      const ids = new_sheets.map((ms) => {
        return ms.id
      })
      return await this.uploadFiles(teamId, files, ids);
    }
    catch (err) {
      return [];
    }
  }
}

export default new StorageService();
