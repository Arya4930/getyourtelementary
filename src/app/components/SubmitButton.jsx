// import main from '@/app/api/index'
import { Button } from '@material-tailwind/react'
import { useState } from 'react'

function SubmitButton({ file }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0)
    const [message, setMessage] = useState('')
    const [eventSource, setEventSource] = useState(null)

    const handleClick = async () => {
        // const videoPath = file.preview
        // const directoryPath = '/public/'
        // const outputFilePath = 'public/results.json'

        // main(videoPath, directoryPath, outputFilePath)
        if (!file) {
            console.log('No file selected');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);

        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/UploadFile', true)


        xhr.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                // console.log(`Loaded: ${event.loaded} / Total: ${event.total}`); // Log both
                const percentCompleted = Math.round((event.loaded / event.total) * 100);
                setProgress(percentCompleted);
                // console.log(`Progress: ${percentCompleted}%`);
            }
        }

        xhr.onload = function (event) {
            const responseLines = xhr.responseText.split('\n');
            
            responseLines.forEach(line => {
                if (line.startsWith('data: ')) {
                    const jsonString = line.substring(6);
                    try {
                        const response = JSON.parse(jsonString);
                        
                        if (response.progress !== undefined) {
                            setProgress(response.progress);
                        } else if (response.message) {
                            setMessage(response.message || "Upload Complete");
                        }
                    } catch (error) {
                        console.error("Failed to parse JSON:", error);
                        setMessage("Invalid response from server");
                    }
                }
            });
        }

        xhr.onerror = function () {
            setMessage('Upload Error')
            setUploading(false)
        }

        xhr.send(formData)

        const source = new EventSource('/api/UploadFile')
        setEventSource(source)

        source.onopen = () => {
            console.log('SSE connection opened');
        };
        
        source.onmessage = (event) => {
            console.log('Received message:', event.data); // Log the raw event data
            try {
                const data = JSON.parse(event.data);
                console.log(data);
                if (data.progress) {
                    setProgress(data.progress);
                } else if (data.message) {
                    setMessage(data.message);
                    setUploading(false);
                    source.close(); // Close the SSE connection when done
                } else if (data.error) {
                    setMessage(data.error);
                    setUploading(false);
                    source.close(); // Close on error
                }
            } catch (error) {
                console.error("Failed to parse JSON:", error);
            }
        };
        
        source.onerror = (error) => {
            console.error('SSE error:', error);
            setMessage('Error in SSE connection');
            setUploading(false);
            source.close(); // Close on error
        };
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