import React, { useState } from "react";
import { FileInput, Button, Stack } from "@mantine/core";

const ResumeUpload = ({ onUpload }) => {
    const [file, setFile] = useState(null);

    return (
        <Stack>
            <FileInput
                placeholder="Upload your resume"
                accept=".pdf,.txt"
                value={file}
                onChange={setFile}
            />
            <Button onClick={() => onUpload(file)} disabled={!file}>
                Upload Resume
            </Button>
        </Stack>
    );
};

export default ResumeUpload;
