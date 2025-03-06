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
  Grid,
  Divider,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import ResumeUpload from '../components/ResumeUpload';
import JobInput from '../components/JobInput';
import JobResults from '../components/JobResults';
import TemplateDownload from '../components/TemplateDownload';
import ToolsSection from '../components/ToolsSection';
import ATSChecker from '../components/ATSChecker';
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
  const [jobDescription, setJobDescription] = useState('');
  const [atsAnalysis, setAtsAnalysis] = useState(null);

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
        // Extract job analysis results
        const results = response.data.results || [];
        setJobResults(results);

        // Extract ATS analysis if available
        if (response.data.ats_analysis) {
          setAtsAnalysis(response.data.ats_analysis);
        }

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

  // Prepare resume blob for components
  const getResumeBlob = () => {
    if (resumeFile) {
      return resumeFile;
    } else if (resumeText) {
      return new Blob([resumeText], { type: 'text/plain' });
    }
    return null;
  };

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

        {/* ATS Compatibility and Job Description Section */}
        {!atsAnalysis && (
          <Paper shadow="sm" radius="md" p="xl" withBorder>
            <Stack spacing="md">
              <Title order={3}>ATS Compatibility Tools</Title>
              <Text color="dimmed">
                Check how well your resume will perform with Applicant Tracking Systems
              </Text>

              <Grid>
                <Grid.Col span={12} md={6}>
                  <Stack spacing="xs">
                    <Text size="sm" weight={500}>
                      Job Description (Optional)
                    </Text>
                    <Textarea
                      placeholder="Paste a job description to check ATS compatibility against specific requirements"
                      minRows={4}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.currentTarget.value)}
                    />
                  </Stack>
                </Grid.Col>

                <Grid.Col span={12} md={6}>
                  <Stack spacing="xs" justify="space-between" style={{ height: '100%' }}>
                    <Text size="sm" weight={500}>
                      ATS Compatibility Check
                    </Text>
                    <Text size="xs" color="dimmed">
                      Check how well your resume performs with Applicant Tracking Systems
                    </Text>
                    <ATSChecker resumeFile={getResumeBlob()} jobDescription={jobDescription} />
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>
        )}

        {/* Only show tools section if there are job results or a job title */}
        {(jobResults.length > 0 || currentJobTitle) && (
          <ToolsSection defaultLanguage={defaultLanguage} />
        )}

        {/* Pass both normal job results and ATS results to the JobResults component */}
        {jobResults.length > 0 && (
          <JobResults
            results={jobResults}
            resumeFile={getResumeBlob()}
            defaultLanguage={defaultLanguage}
            ats_analysis={atsAnalysis}
          />
        )}
      </Stack>
    </Container>
  );
};

export default Home;
