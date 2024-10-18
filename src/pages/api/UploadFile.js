import { BlobServiceClient, BlockBlobParallelUploadOptions } from "@azure/storage-blob";
import formidable from "formidable";

// Initialize the BlobServiceClient with your connection string
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

// Next.js API configuration for file parsing
export const config = {
    api: {
        bodyParser: false // Disable the default body parser to handle file uploads
    }
}

// Main function to handle blob uploads
export default async function UploadBlob(req, res) {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.status(500).json({ error: 'Error parsing the files' });
            res.end();
            return;
        }

        const file = files.file; // Expecting a file upload under the key 'file'
        if (!file) {
            res.status(400).json({ error: 'No file uploaded' });
            res.end();
            return;
        }

        try {
            const containerClient = blobServiceClient.getContainerClient('video-frames');
            const blockBlobClient = containerClient.getBlockBlobClient(file.originalFilename);
        
            // Set headers for SSE
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
        
            // Function to handle progress
            const onProgress = (progress) => {
                if (progress.loadedBytes) {
                    const percentCompleted = (progress.loadedBytes / file.size) * 100;
                    res.write(`data: ${JSON.stringify({ progress: percentCompleted.toFixed(2) })}\n\n`);
                }
            };

            // Upload the blob with progress reporting
            await blockBlobClient.uploadFile(file.filepath, {
                onProgress,
                blockSize: 4 * 1024 * 1024, // 4 MiB block size
                concurrency: 2, // Max number of parallel transfers
                maxSingleShotSize: 8 * 1024 * 1024 // 8 MiB single transfer size
            });
        
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
