import 'dotenv/config';
// import getExcelSheet from './getExcelSheet';
// import extractFrames from './extractframes';
// import processImages from './processImages';
import { BlobServiceClient } from '@azure/storage-blob';

// const directoryPath = './video-dataset';
// const outputFilePath = './results.json';
// const videoPath = './video-dataset/Untitled video - Made with Clipchamp (1).mp4'

// async function main(videoPath, directoryPath, outputFilePath) {
//     try {
//         listblobs()
//         // await extractFrames(videoPath);
//         // await processImages(directoryPath, outputFilePath); 
//         // getExcelSheet(outputFilePath)
//     } catch (err) {
//         console.error('Error:', err.message);
//     }
// }

// export default main;

export default async function handler(req, res) {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
        const containerClient = blobServiceClient.getContainerClient('results');

        let blobs = [];
        let i = 1;
        for await (const blob of containerClient.listBlobsFlat()) {
            blobs.push({ id: i++, name: blob.name });
        }

        res.status(200).json(blobs)
    } catch (err){
        res.status(500).json({ error: err.message })
    }
}