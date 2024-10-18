import { Button } from '@material-tailwind/react'
import { useState } from 'react'

function SubmitButton({ file }) {
    const [uploading, setUploading] = useState(false);

    const handleClick = async () => {
        // const videoPath = file.preview
        // const directoryPath = '/public/'
        // const outputFilePath = 'public/results.json'

        // main(videoPath, directoryPath, outputFilePath)
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);

        try {
            const response = await fetch('/api/UploadFile', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error('Upload failed')
            }

            const data = await response.json()
            console.log(data)
        } catch (error) {
            console.error('Upload Error:', error.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div>
            <Button
                className="text-lg px-8 py-3 bg-blue-500 text-white border-none rounded-lg hover:bg-blue-600"
                variant="outlined"
                onClick={handleClick}
                disabled={uploading}
            >
                {uploading ? 'Uploading...' : 'Submit'}
            </Button>
        </div>
    )
}

export default SubmitButton;