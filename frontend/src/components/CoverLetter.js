import React, { useState } from "react";
import { Button, Textarea, Stack } from "@mantine/core";
import axios from "axios";

const CoverLetter = ({ jobDescription, resumeText }) => {
    const [coverLetter, setCoverLetter] = useState("");
    const [loading, setLoading] = useState(false);

    const generateCoverLetter = async () => {
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:8000/generate-cover-letter", {
                resume: resumeText,
                job_description: jobDescription,
            });

            setCoverLetter(response.data.cover_letter);
        } catch (error) {
            console.error("Error generating cover letter:", error);
        }
        setLoading(false);
    };

    return (
        <Stack>
            <Button onClick={generateCoverLetter} loading={loading}>
                Generate Cover Letter
            </Button>
            {coverLetter && <Textarea value={coverLetter} readOnly minRows={6} />}
        </Stack>
    );
};

export default CoverLetter;
