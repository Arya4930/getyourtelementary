import { BlobServiceClient } from "@azure/storage-blob";
import formidable from "formidable";

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function UploadBlob(req, res) {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error parsing the files' });
        }

        const file = files.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            const containerClient = blobServiceClient.getContainerClient('results');
            const blobName = file.originalFilename;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders();

            const keepAlive = setInterval(() => {
                res.write(': keep-alive\n\n');
            }, 30000);

            const onProgress = (progress) => {
                if (progress.loadedBytes) {
                    const percentCompleted = (progress.loadedBytes / file.size) * 100;
                    res.write(`data: ${JSON.stringify({ progress: percentCompleted.toFixed(2) })}\n\n`);
                    res.flushHeaders();
                }
            };

            console.log(`Uploading file: ${file.filepath}, size: ${file.size} bytes`);

            const uploadBlobResponse = await blockBlobClient.uploadFile(file.filepath, {
                onProgress,
            });

            res.write(`data: ${JSON.stringify({ message: `Upload block blob ${blobName} successfully`, requestId: uploadBlobResponse.requestId })}\n\n`);
            res.end();
            clearInterval(keepAlive);
        } catch (uploadError) {
            console.error('Error uploading blob:', uploadError);
            res.write(`data: ${JSON.stringify({ error: uploadError.message || 'Error uploading blob' })}\n\n`);
            res.end();
        }
    });
}
