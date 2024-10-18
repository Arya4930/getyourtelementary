// import main from '@/app/api/index'
import { Button } from '@material-tailwind/react'
import handler from '../api/index'
import { useState, useEffect } from 'react'

function SubmitButton({ file }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0)
    const [message, setMessage] = useState('')

    const handleClick = async () => {
        // const videoPath = file.preview
        // const directoryPath = '/public/'
        // const outputFilePath = 'public/results.json'

        // main(videoPath, directoryPath, outputFilePath)
        if(!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);

        const xhr = new XMLHttpRequest()
        xhr.open('POST','/api/UploadFile', true)

        xhr.upload.onprogress = function (event){
            if (event.lengthComputable) {
                const percentCompleted = Math.round((event.loaded / event.total) * 100);
                setProgress(percentCompleted);
            }
        }

        xhr.onload = function (event) {
            if(xhr.status === 200){
                const response = JSON.parse(xhr.responseText);
                setMessage(response.message || "Upload Complete")
                setUploading(false)
            } else {
                setMessage("Upload Failed")
                setUploading(false)
            }
        }

        xhr.onerror = function () {
            setMessage('Upload Error')
            setUploading(false)
        }

        xhr.send(formData)
    }

    return (
        <div>
            <Button className="text-lg px-8 py-3 bg-blue-500 text-white border-none rounded-lg hover:bg-blue-600"
                variant="outlined" onClick={handleClick} disabled={uploading}
            >
                {uploading ? 'Uploading...' : 'Submit'}
            </Button>
            {uploading && (
                <div>
                    <p>Uploading... {progress}%</p>
                    <progress value={progress} max="100">{progress}%</progress>
                </div>
            )}
            {message && <p>{message}</p>}
        </div>
    )
}

export default SubmitButton;