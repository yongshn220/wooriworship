import { storage } from "@/firebase"

class StorageService {
    constructor() {}

    async uploadFile(teamId: string, filename: string, file: File) {
        const fileRef = storage.ref().child(teamId+"/"+filename);
        try {
            const result = await fileRef.put(file);
            console.log("file "+filename+" has been put in the directory: "+result.metadata.fullPath);
            return result.metadata.fullPath;
        } catch (err) {
            console.error("Error uploading file:", err);
        }
    }

    async uploadFiles(folder_name: string, prefix: string, files: Array<File>) {
        let uploads:Array<any> = [];
        try {
            for(const i in files) {
                const fileRef = storage.ref().child(`${folder_name}/${prefix}-스플릿-${files[i].name}`);
                uploads.push(fileRef.put(files[i]));
            }
            uploads = await Promise.all(uploads);
            console.log("multiple files have been uploaded");
            return uploads.map((x:any) => x.metadata.fullPath);
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
}

export default new StorageService();