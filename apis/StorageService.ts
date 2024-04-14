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

    /*async uploadfiles(teamId: string, fileList: Array<File>) {

    }*/
}

export default new StorageService();