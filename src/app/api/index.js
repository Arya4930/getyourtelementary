const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
require('dotenv').config();
const getExcelSheet = require('./functions/getExcelSheet');
const extractFrames = require('./functions/extractframes');
const processImages = require('./functions/processImages')

ffmpeg.setFfmpegPath(ffmpegPath);

const directoryPath = './video-dataset';
const outputFilePath = './results.json';
const videoPath = './video-dataset/Untitled video - Made with Clipchamp (1).mp4'

async function main() {
    try {
        await extractFrames(videoPath);
        await processImages(directoryPath, outputFilePath); 
        getExcelSheet(outputFilePath)
    } catch (err) {
        console.error('Error:', err.message);
    }
}

main();