"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import SubmitButton from "../components/SubmitButton"

export default function Dropzone({ className }) {
    const [file, setFile] = useState(null); // Initialize with null to handle a single file
    const onDrop = useCallback(acceptedFiles => {
        const firstFile = acceptedFiles[0]
        setFile(Object.assign(firstFile, {
            preview: URL.createObjectURL(firstFile)
        }));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <main>
            {!file && ( // Check if file is null, not file.length
                <form>
                    <div {...getRootProps({
                        className: className
                    })}>
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <p>Drop the files here...</p>
                        ) : (
                            <p>Drag and drop some files here or click to select files</p>
                        )}
                    </div>
                </form>
            )}
            {file && (
                <div key={file.name} className="flex flex-col items-center space-y-4 content-center">
                    {console.log(file.preview)}
                    <p className="mt-10">{file.name}</p>
                    <video width="750" height="500" controls>
                        <source src={file.preview} type="video/mp4" />
                    </video>
                    <div className="flex w-max items-end gap-4">
                        <SubmitButton file={file} />
                    </div>
                </div>
            )}
        </main>
    )
}