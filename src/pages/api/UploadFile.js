import { BlobServiceClient } from "@azure/storage-blob";
import fs from 'fs'
import formidable from "formidable";

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

export const config = {
    api: {
        bodyParser: false
    }
}

export default async function UploadBlob(req, res) {
    const form = new formidable.IncomingForm()

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error parsing the files' });
        }
        const file = files.file
        const containerClient = blobServiceClient.getContainerClient('results')
        const blobName = file.originalFilename
        const blockBlobClient = containerClient.getBlockBlobClient(blobName)

        try {
            const uploadBlobResponse = await blockBlobClient.uploadFile(file.filepath);
            res.status(200).json({ message: `Upload block blob ${blobName} successfully`, requestId: uploadBlobResponse.requestId });
        } catch (uploadError) {
            console.error('Error uploading blob:', uploadError.message);
            res.status(500).json({ error: 'Error uploading blob' });
        }
    })
}