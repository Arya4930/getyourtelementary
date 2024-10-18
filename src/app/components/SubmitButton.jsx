import { Button } from '@material-tailwind/react';
import { useState } from 'react';

function SubmitButton({ file }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');

    const handleClick = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setProgress(0); // Reset progress before starting upload

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/UploadBlob', true); // Make sure this matches your API route

        // Update progress as the upload progresses
        xhr.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                const percentCompleted = Math.round((event.loaded / event.total) * 100);
                setProgress(percentCompleted);
            }
        };

        // Create an EventSource to listen for progress updates
        const eventSource = new EventSource('/api/UploadBlob'); // Use the correct API route

        eventSource.onmessage = function (event) {
            const data = JSON.parse(event.data);
            if (data.progress) {
                setProgress(data.progress); // Update progress from SSE
            }
            if (data.message) {
                setMessage(data.message);
                setUploading(false);
                eventSource.close(); // Close the connection once the upload is complete
            }
            if (data.error) {
                setMessage(data.error);
                setUploading(false);
                eventSource.close(); // Close on error
            }
        };

        xhr.onload = function () {
            if (xhr.status === 200) {
                console.log('Upload successful:', xhr.responseText);
            } else {
                setMessage("Upload Failed");
                setUploading(false);
            }
        };

        xhr.onerror = function () {
            setMessage('Upload Error');
            setUploading(false);
        };

        xhr.send(formData);
    };

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
            {uploading && (
                <div>
                    <p>Uploading... {progress}%</p>
                    <progress value={progress} max="100">{progress}%</progress>
                </div>
            )}
            {message && <p>{message}</p>}
        </div>
    );
}

export default SubmitButton;
