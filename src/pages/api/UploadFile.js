import { BlobServiceClient } from "@azure/storage-blob";
import formidable from "formidable";

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

export const config = {
    api: {
        bodyParser: false
    }
}

export default async function UploadBlob(req, res) {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.status(500).json({ error: 'Error parsing the files' });
            res.end();
            return;
        }

        const file = files.file;
        if (!file) {
            res.status(400).json({ error: 'No file uploaded' });
            res.end();
            return;
        }

        try {
            const containerClient = blobServiceClient.getContainerClient('video-frames');
            const blobName = `${file.originalFilename}`; // Use only the filename, adjust if you want a "folder"
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders();
        
            const onProgress = (progress) => {
                if (progress.loadedBytes) {
                    const percentCompleted = (progress.loadedBytes / file.size) * 100;
                    console.log(`Progress: ${progress.loadedBytes} / ${file.size} bytes (${percentCompleted.toFixed(2)}%)`);

                    // Sending progress back to client
                    res.write(`data: ${JSON.stringify({ progress: percentCompleted.toFixed(2) })}\n\n`);
                }
            };

            // Upload file to Azure Blob Storage and track progress
            const uploadBlobResponse = await blockBlobClient.uploadFile(file.filepath, {
                onProgress
            });

            res.write(`data: ${JSON.stringify({ message: `Upload block blob ${blobName} successfully`, requestId: uploadBlobResponse.requestId })}\n\n`);
            res.end();
        } catch (uploadError) {
            console.error('Error uploading blob:', uploadError);
            res.write(`data: ${JSON.stringify({ error: uploadError.message || 'Error uploading blob' })}\n\n`);
            res.end();
        }
    });
}