// import main from '@/app/api/index'
import { Button } from '@material-tailwind/react'
import handler from '../api/index'
import { useState, useEffect } from 'react'

function SubmitButton({ file }) {
    const [blobs, setBlobs] = useState([]);

    const handleClick = async () => {
        // const videoPath = file.preview
        // const directoryPath = '/public/'
        // const outputFilePath = 'public/results.json'

        // main(videoPath, directoryPath, outputFilePath)
        try {
            const response = await fetch('/api/listblobs');
            if (!response.ok) {
                throw new Error('Failed to fetch blobs');
            }
            const data = await response.json();
            setBlobs(data);
        } catch (error) {
            console.error('Error fetching blobs:', error.message);
        }
    }

    return (
        <div>
            <Button className="text-lg px-8 py-3 bg-blue-500 text-white border-none rounded-lg hover:bg-blue-600"
                variant="outlined" onClick={handleClick}
            >
                submit
            </Button>
            <ul>
                {blobs.map((blob, index) => (
                    <li key={index}>{blob.name}</li>
                ))}
            </ul>
        </div>
    )
}

export default SubmitButton;