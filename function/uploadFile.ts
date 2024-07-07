import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    UploadMetadata,
} from "firebase/storage";
import { storage } from "@/firebase";

const uploadFile = async (
    files: File[],
    orgId: string,
    path: string,
    metadata: object
) => {
    const uploadPromises = files.map((file) => {
        const storageRef = ref(storage, `organization/${orgId}/${path}/${file.name}`);

        return uploadBytes(storageRef, file, metadata);
    });

    try {
        const snapshots = await Promise.all(uploadPromises);
        console.log("Uploaded files!", snapshots);
    } catch (error) {
        console.error("Error uploading files:", error);
    }
};

export default uploadFile;
