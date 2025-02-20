import React, { useState } from 'react';
import { Container, Title, Button, Textarea, FileInput, Group, Table, Modal, Stack } from '@mantine/core';
import ResumeUpload from '../components/ResumeUpload';
import JobInput from '../components/JobInput';
import JobResults from '../components/JobResults';
import axios from 'axios';

const Home = () => {
    const [resumeText, setResumeText] = useState('');
    const [jobLinks, setJobLinks] = useState([]);
    const [analysisResults, setAnalysisResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [coverLetterModal, setCoverLetterModal] = useState({ open: false, coverLetter: '' });

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/analyze', {
                resume: resumeText,
                jobLinks: jobLinks
            });
            setAnalysisResults(response.data.results);
        } catch (error) {
            console.error('Error analyzing resume:', error);
        }
        setLoading(false);
    };

    const handleGenerateCoverLetter = async (jobLink) => {
        try {
            const response = await axios.post('http://localhost:5000/api/cover-letter', {
                resume: resumeText,
                jobLink: jobLink
            });
            setCoverLetterModal({ open: true, coverLetter: response.data.coverLetter });
        } catch (error) {
            console.error('Error generating cover letter:', error);
        }
    };

    return (
        <Container>
            <Title align="center" my="md">Job Match Analyzer</Title>
            <Stack spacing="lg">
                <ResumeUpload resumeText={resumeText} setResumeText={setResumeText} />
                <JobInput jobLinks={jobLinks} setJobLinks={setJobLinks} />
                <Group position="center" mt="md">
                    <Button onClick={handleAnalyze} loading={loading}>Analyze Resume</Button>
                </Group>
            </Stack>
            {analysisResults.length > 0 && (
                <JobResults results={analysisResults} onGenerateCoverLetter={handleGenerateCoverLetter} />
            )}
            <Modal
                opened={coverLetterModal.open}
                onClose={() => setCoverLetterModal({ ...coverLetterModal, open: false })}
                title="Generated Cover Letter"
            >
                <Textarea value={coverLetterModal.coverLetter} readOnly autosize minRows={6} />
            </Modal>
        </Container>
    );
};

export default Home;
