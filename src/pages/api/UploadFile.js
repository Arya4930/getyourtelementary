import { BlobServiceClient } from "@azure/storage-blob";
import formidable from "formidable";
import fs from "fs"; // Ensure fs is imported to read the file stream

export const config = {
    api: {
        bodyParser: false
    }
};

export default async function UploadBlob(req, res) {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.status(500).json({ error: 'Error parsing the files' });
            res.end();
            return;
        }

        const file = files.file; // Assuming the input field name is 'file'
        if (!file) {
            res.status(400).json({ error: 'No file uploaded' });
            res.end();
            return;
        }

        try {
            const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
            const containerClient = blobServiceClient.getContainerClient('video-frames');
            const blockBlobClient = containerClient.getBlockBlobClient(file.originalFilename);

            // Set headers for SSE
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const maxConcurrency = 5; // max uploading concurrency
            const blockSize = 4 * 1024 * 1024; // the block size in the uploaded block blob

            // Start the upload stream
            await blockBlobClient.uploadStream(
                fs.createReadStream(file.filepath, { highWaterMark: blockSize }),
                blockSize,
                maxConcurrency,
                {
                    onProgress: (ev) => {
                        // Emit progress to the client
                        const percentCompleted = (ev.loadedBytes / file.size) * 100;
                        res.write(`data: ${JSON.stringify({ progress: percentCompleted.toFixed(2) })}\n\n`);
                        console.log(`data: ${JSON.stringify({ progress: percentCompleted.toFixed(2) })}\n`)
                    }
                }
            );

            // Send final success message
            res.write(`data: ${JSON.stringify({ message: `Upload block blob ${file.originalFilename} successfully` })}\n\n`);
            res.end();
        } catch (uploadError) {
            console.error('Error uploading blob:', uploadError);
            res.write(`data: ${JSON.stringify({ error: uploadError.message || 'Error uploading blob' })}\n\n`);
            res.end();
        }
    });
}
