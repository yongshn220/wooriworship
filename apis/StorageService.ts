import { storage } from "@/firebase"
import {deleteObject, getDownloadURL, ref, uploadBytesResumable} from "firebase/storage";

class StorageService {
    constructor() {}

    async refTest(url: string) {
        const refer = ref(storage, url)
        return refer.fullPath;
    }

    // async uploadFile(teamId: string, filename: string, file: File) {
    //     const fileRef = storage.ref().child(teamId+"/"+filename);
    //     try {
    //         const result = await fileRef.put(file);
    //         console.log("file "+filename+" has been put in the directory: "+result.metadata.fullPath);
    //         return await result.ref.getDownloadURL();
    //     } catch (err) {
    //         console.error("Error uploading file:", err);
    //     }
    // }

    async uploadFiles(folder_name: string, files: Array<File>) {
        let uploads:Array<any> = [];
        try {
            for(const i in files) {
                const fileRef = storage.ref().child(`${folder_name}/${files[i].name}`);
                uploads.push(fileRef.put(files[i]));
            }
            uploads = await Promise.all(uploads);
            console.log("multiple files have been uploaded");
            return await Promise.all(uploads.map((x:any) => x.ref.getDownloadURL()));
        } catch (err) {
            console.error("Error uploading file:", err);
            return [];
        }
    }

    async downloadFile(fileUrl: string) {
        const fileRef = storage.ref().child(fileUrl)
        try {
            const downloadUrl = await fileRef.getDownloadURL();
            return downloadUrl;
        } catch (err) {
            console.log("Error getting download url: " + err);
        }
    }

    async deleteFile(fileUrl: string) {
        const fileRef = storage.ref().child(fileUrl)
        try {
            await deleteObject(fileRef);
            return true;
        } catch (err) {
            console.log("Delete failed: "+ err);
            return false;
        }
    }

    async downloadMusicSheet(team_id: string, song_id: string, sheet_name: string) {
       return await this.downloadFile(`${team_id}/${song_id}-스플릿-${sheet_name}`);
    }

    // async deleteMusicSheets(sheet_directories: Array<string>) {
    //     const promises = [];
    //     try {
    //         for(let directory of sheet_directories) {
    //             promises.push(this.deleteFile(directory));
    //         }
    //         await Promise.all(promises);
    //         return sheet_directories;
    //     } catch (err) {
    //         return [];
    //     }
    // }

    async deleteMusicSheets(urls: Array<string>) {
        const promises = [];
        try {
            for(let url of urls) {
                const sheetRef = ref(storage, url)
                promises.push(deleteObject(sheetRef));
            }
            await Promise.all(promises);
            return true;
        } catch (err) {
            return false;
        }
    }

    async updateMusicSheets(teamId: string, new_sheets: Array<File>, delete_sheets: Array<string>) {
        try{
            await this.deleteMusicSheets(delete_sheets);
            return await this.uploadFiles(teamId, new_sheets);
        } catch (err) {
            return [];
        }
    }
}

export default new StorageService();