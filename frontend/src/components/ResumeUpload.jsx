// ResumeUpload.jsx
import React, { useState } from 'react';
import { FileInput, Group, Textarea } from '@mantine/core';

const ResumeUpload = ({ resumeText, setResumeText, resumeFile, setResumeFile }) => {
    const handleFileChange = (file) => {
        // Instead of reading file content, just store the File object in state
        setResumeFile(file);
    };

    return (
        <Group direction="column" grow>
            <Textarea
                label="Paste your resume here (optional)"
                placeholder="Enter your resume in text format..."
                value={resumeText}
                onChange={(e) => setResumeText(e.currentTarget.value)}
                autosize
                minRows={6}
            />
            <FileInput
                label="Or upload your resume (PDF)"
                accept="application/pdf"
                onChange={handleFileChange}
            />
        </Group>
    );
};

export default ResumeUpload;
