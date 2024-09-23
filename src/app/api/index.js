import 'dotenv/config';
import getExcelSheet from './getExcelSheet';
import extractFrames from './extractframes';
import processImages from './processImages';

// const directoryPath = './video-dataset';
// const outputFilePath = './results.json';
// const videoPath = './video-dataset/Untitled video - Made with Clipchamp (1).mp4'

async function main(videoPath, directoryPath, outputFilePath) {
    try {
        await extractFrames(videoPath);
        await processImages(directoryPath, outputFilePath); 
        getExcelSheet(outputFilePath)
    } catch (err) {
        console.error('Error:', err.message);
    }
}

export default main();