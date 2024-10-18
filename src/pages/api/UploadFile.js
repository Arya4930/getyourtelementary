import { BlobServiceClient } from "@azure/storage-blob";
import formidable from "formidable";

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

export const config = {
    api: {
        bodyParser: false
    }
};

export default async function UploadBlob(req, res) {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing the form:', err);
            return res.status(500).json({ error: 'Error parsing the files' });
        }

        const file = files.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const containerClient = blobServiceClient.getContainerClient('results');
        const blobName = file.originalFilename;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        try {
            // Uploading the file using a stream
            const stream = fs.createReadStream(file.filepath);
            const uploadBlobResponse = await blockBlobClient.uploadStream(stream, file.size, undefined, {
                onProgress: (progress) => {
                    const percentCompleted = (progress.loadedBytes / file.size) * 100;
                    console.log(`Progress: ${percentCompleted.toFixed(2)}%`);
                }
            });

            res.status(200).json({ message: `Upload block blob ${blobName} successfully`, requestId: uploadBlobResponse.requestId });
        } catch (uploadError) {
            console.error('Error uploading blob:', uploadError);
            res.status(500).json({ error: uploadError.message || 'Error uploading blob' });
        }
    });
}
