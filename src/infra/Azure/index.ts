import { BlobServiceClient } from "@azure/storage-blob";
import fs from 'fs';

const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
const CONTAINER_NAME = process.env.CONTAINER_NAME || "";

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

// connect to container
export const getContainer = () => {
    return blobServiceClient.getContainerClient(CONTAINER_NAME);
}

// upload file to container
export const uploadToContainer = async (filename: string) => {
    return await getContainer().getBlockBlobClient(filename);
}

// list file inside container (not in use)
export const listFiles = async () => {
    let result = [];
    let files = await getContainer().listBlobsFlat();
    for await (const blob of files) {
        result.push(blob.name);
    }
    return await result
}

// uploading images after storing through Multer
export const uploadImage = async (fileName: string, fileBuffer: any) => {
    try {
        let stream = fs.createReadStream(fileBuffer);        
        return await (await uploadToContainer(fileName)).uploadStream(stream,
            uploadOptions.bufferSize, uploadOptions.maxBuffers,
            { blobHTTPHeaders: { blobContentType: "image/jpeg" } }
        );
    } catch (err) {
        return err    
    }
}