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
        xhr.open('POST', '/api/UploadFile', true);

        // Update progress as the upload progresses
        xhr.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                const percentCompleted = Math.round((event.loaded / event.total) * 100);
                setProgress(percentCompleted);
            }
        };

        const eventSource = new EventSource('/api/UploadFile'); // Connect to your upload endpoint

        eventSource.onmessage = function (event) {
            const data = JSON.parse(event.data);
            if (data.progress) {
                setProgress(data.progress);
            }
            if (data.message) {
                setMessage(data.message);
                setUploading(false);
                eventSource.close(); // Close the connection once the upload is complete
            }
        };

        xhr.onload = function () {
            if (xhr.status === 200) {
                let response;
                try {
                    if (xhr.responseText.startsWith("data:")) {
                        const dataLine = xhr.responseText.split('\n')[0];
                        const jsonData = dataLine.replace('data: ', '');
                        response = JSON.parse(jsonData);
                    } else {
                        response = JSON.parse(xhr.responseText); // Standard JSON response
                    }
                    setMessage("Upload Complete");
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    console.log('Response Text was:', xhr.responseText); // Log for debugging
                    setMessage('Invalid server response');
                }
                setUploading(false);
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
    );
}

export default SubmitButton;
