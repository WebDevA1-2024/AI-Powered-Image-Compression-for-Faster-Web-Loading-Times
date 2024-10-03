import React, { useState } from 'react';

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            setMessage('Please select a file');
            return;
        }

        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const connectionType = connection ? connection.effectiveType : '4g';
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('connectionType', connectionType);
        formData.append('screenWidth', screenWidth);
        formData.append('screenHeight', screenHeight);

        const response = await fetch('http://127.0.0.1:3000/compress-image', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        setMessage(result.message);
    };

    return (
        <div>
            <h1>AI-Powered Image Compression</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleSubmit}>Upload and Compress</button>
            {message && <p>{message}</p>}
        </div>
    );
}

export default App;
