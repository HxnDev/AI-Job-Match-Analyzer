import { useState, useEffect } from 'react';
import {
  Container,
  Stack,
  Title,
  Paper,
  Text,
  Button,
  LoadingOverlay,
  Textarea,
  Group,
  Collapse,
  Switch,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import ResumeUpload from '../components/ResumeUpload';
import JobInput from '../components/JobInput';
import JobResults from '../components/JobResults';
import TemplateDownload from '../components/TemplateDownload';
import ToolsSection from '../components/ToolsSection';
import axios from 'axios';

const Home = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobLinks, setJobLinks] = useState([]);
  const [jobResults, setJobResults] = useState([]);
  const [loading, handlers] = useDisclosure(false);
  const [showCustomInstructions, { toggle: toggleCustomInstructions }] = useDisclosure(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [currentJobTitle, setCurrentJobTitle] = useState('');

  // Load default language preference when component mounts
  useEffect(() => {
    const savedLanguage = localStorage.getItem('defaultLanguage');
    if (savedLanguage) {
      setDefaultLanguage(savedLanguage);
    }
  }, []);

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

    // Add custom instructions if provided
    if (customInstructions.trim()) {
      formData.append('custom_instructions', customInstructions);
    }

    try {
      const response = await axios.post('http://localhost:5050/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const results = response.data.results || [];
        setJobResults(results);

        // Extract job title from the first result if available
        if (results.length > 0 && results[0].job_title) {
          setCurrentJobTitle(results[0].job_title);
        }

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

  // Listen for changes to localStorage from other components
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLanguage = localStorage.getItem('defaultLanguage');
      if (savedLanguage) {
        setDefaultLanguage(savedLanguage);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Container size="lg" py="xl">
      <Stack spacing="xl">
        <Title order={1} align="center" color="blue">
          JobFit
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

            <Group position="right">
              <Switch
                label="Add custom instructions"
                checked={showCustomInstructions}
                onChange={toggleCustomInstructions}
              />
            </Group>

            <Collapse in={showCustomInstructions}>
              <Textarea
                placeholder="Add custom instructions for the analysis (e.g., 'Focus on data science skills', 'Emphasize leadership experience')"
                label="Custom Instructions"
                minRows={3}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.currentTarget.value)}
              />
            </Collapse>

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

        {/* Only show tools section if there are job results or a job title */}
        {(jobResults.length > 0 || currentJobTitle) && (
          <ToolsSection defaultLanguage={defaultLanguage} />
        )}

        <JobResults
          results={jobResults}
          resumeFile={
            resumeFile || (resumeText ? new Blob([resumeText], { type: 'text/plain' }) : null)
          }
          defaultLanguage={defaultLanguage}
        />
      </Stack>
    </Container>
  );
};

export default Home;
