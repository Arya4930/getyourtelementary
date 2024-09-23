import fs from 'fs'
const createClient = require('@azure-rest/ai-vision-image-analysis').default;
import { AzureKeyCredential } from '@azure/core-auth';

const credential = new AzureKeyCredential(process.env.VISION_KEY);
const client = createClient(process.env.VISION_ENDPOINT, credential);

const features = ['Read'];

async function analyzeImageFromFile(imagePath) {
    try {
        const imageData = fs.readFileSync(imagePath);

        const result = await client.path('/imageanalysis:analyze').post({
            body: imageData,
            queryParameters: {
                features: features,
            },
            headers: {
                'Content-Type': 'application/octet-stream',
            },
        });

        const iaResult = result.body;

        let time = null;
        let speed = null;
        let altitude = null;

        if (iaResult.readResult && iaResult.readResult.blocks) {
            const words = iaResult.readResult.blocks.flatMap(block =>
                block.lines.flatMap(line =>
                    line.words.map(word => ({
                        text: word.text,
                        boundingPolygon: word.boundingPolygon
                    }))
                )
            );
            a = []
            words.filter(word => {
                return (word.boundingPolygon[2].x < 400 && word.boundingPolygon[2].y < 1100)
            }).map(word => {
                a.push(word.text)
            })
            // const filteredWords = a.filter(word => {
            //     // Check if word is a valid number (integer or float)
            //     const isNumber = /^\d+(\.\d+)?$/.test(word);

            //     // Check if word matches the time pattern 'T+00:XX:XX'
            //     const isTime = /^00:\d{2}:\d{2}$/.test(word);
            //     const isKeyword = /^(KM\/H|KM)$/.test(word); // Matches 'KM/H' or 'KM'

            //     return isNumber || isTime ||  isKeyword;
            // });

            // words.forEach((word, index) => {
            //     if (word.startsWith('T-') || word.startsWith('T+')) {
            //         time = word.split`+`[1];
            //     } else if (word.includes('KM/H')) {
            //         speed = words[index - 1];
            //     } else if (word.includes('ALTITUDE')) {
            //         altitude = words[index + 1];
            //     }
            // });

            words.forEach(word => {
                if (/^T\+\d{2}:\d{2}:\d{2}$/.test(word.text)) {
                    time = word.text.substring(2)
                }
            });
            if (a[2] < a[3]) {
                speed = a[3]
                altitude = a[2]
            } else {
                speed = a[2]
                altitude = a[3]
            }

            const telemetryData = {
                time: time || 'Not found',
                speed: parseInt(speed) || 0,
                altitude: parseInt(altitude) || 0,
            };
            console.log(telemetryData)
            if( telemetryData.time === 'Not found' && telemetryData.speed === 0 && telemetryData.altitude === 0) {return;}
            return telemetryData
        } else {
            console.log('No text detected.');
        }
    } catch (error) {
        console.error('Error analyzing image:', error);
    }
}

export default analyzeImageFromFile