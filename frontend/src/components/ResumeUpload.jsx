import React from "react";

function ResumeUpload({ setResumeFile }) {
    const handleFileChange = (event) => {
        setResumeFile(event.target.files[0]);
    };

    return (
        <div>
            <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} />
        </div>
    );
}

export default ResumeUpload;
