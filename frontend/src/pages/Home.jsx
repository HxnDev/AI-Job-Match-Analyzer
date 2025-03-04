import { useState } from 'react';
import { Container, Stack, Title, Paper, Text, Button, LoadingOverlay } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import ResumeUpload from '../components/ResumeUpload';
import JobInput from '../components/JobInput';
import JobResults from '../components/JobResults';
import TemplateDownload from '../components/TemplateDownload';
import axios from 'axios';

const Home = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobLinks, setJobLinks] = useState([]);
  const [jobResults, setJobResults] = useState([]);
  const [loading, handlers] = useDisclosure(false);

  const handleAnalyze = async () => {
    if ((!resumeFile && !resumeText) || jobLinks.length === 0) {
      notifications.show({
        title: 'Missing Information',
        message: 'Please provide a resume and at least one job link',
        color: 'red',
      });
      return;
    }

    handlers.open();
    const formData = new FormData();

    // Handle resume input
    if (resumeFile) {
      formData.append('resume', resumeFile);
    } else if (resumeText) {
      const textFile = new Blob([resumeText], { type: 'text/plain' });
      formData.append('resume', textFile, 'resume.txt');
    }

    formData.append('job_links', JSON.stringify(jobLinks));

    try {
      const response = await axios.post('http://localhost:5050/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setJobResults(response.data.results || []);
        notifications.show({
          title: 'Success',
          message: 'Resume analysis completed',
          color: 'green',
        });
      } else {
        throw new Error(response.data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Error analyzing resume. Please try again.',
        color: 'red',
      });
    } finally {
      handlers.close();
    }
  };

  return (
    <Container size="lg" py="xl">
      <Stack spacing="xl">
        <Title order={1} align="center" color="blue">
          Job Match Analyzer
        </Title>

        <Text size="lg" color="dimmed" align="center">
          Upload your resume and add job links to analyze your match score
        </Text>

        <TemplateDownload />

        <Paper shadow="sm" radius="md" p="xl" withBorder>
          <Stack spacing="md" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} overlayBlur={2} />
            <ResumeUpload
              setResumeFile={setResumeFile}
              resumeText={resumeText}
              setResumeText={setResumeText}
            />

            <JobInput jobLinks={jobLinks} setJobLinks={setJobLinks} />

            <Button
              onClick={handleAnalyze}
              disabled={(!resumeFile && !resumeText) || jobLinks.length === 0}
              loading={loading}
              fullWidth
              size="md"
              color="blue"
            >
              {loading ? 'Analyzing...' : 'Analyze Resume'}
            </Button>
          </Stack>
        </Paper>

        <JobResults
          results={jobResults}
          resumeFile={
            resumeFile || (resumeText ? new Blob([resumeText], { type: 'text/plain' }) : null)
          }
        />
      </Stack>
    </Container>
  );
};

export default Home;
