import fs from 'fs';
import path from 'path';
import analyzeImageFromFile from './analyzeImageFromFile';

async function processImages(directoryPath, outputFilePath) {
    const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.png'));
    const results = [];

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        console.log(`Processing ${filePath}`);
        const data = await analyzeImageFromFile(filePath);
        results.push({ file: file, ...data });
    }

    fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2));
    console.log(`Results saved to ${outputFilePath}`);
}

export default processImages;