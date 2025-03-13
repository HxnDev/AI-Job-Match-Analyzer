import {
  Text,
  Button,
  Stack,
  Badge,
  Modal,
  List,
  Group,
  Paper,
  Textarea,
  Menu,
  ActionIcon,
  CopyButton,
  Tooltip,
  Grid,
  Divider,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import {
  IconChevronDown,
  IconLanguage,
  IconPlus,
  IconCopy,
  IconCheck,
  IconMessageCircle,
  IconFileText,
  IconPencil,
  IconAlertCircle,
} from '@tabler/icons-react';
import ResumeReview from './ResumeReview';
import LanguageSelector from './LanguageSelector';
import ATSChecker from './ATSChecker';
import LearningRecommender from './LearningRecommender';
import InterviewPreparation from './InterviewPreparation/InterviewPreparation';
import { getApiUrl, getApiKey } from '../utils/apiConfig';
import { ApiKeyContext } from '../App';

const JobResults = ({ results, resumeFile }) => {
  const { hasApiKey, refreshApiKeyStatus } = useContext(ApiKeyContext);
  const [coverLetter, setCoverLetter] = useState('');
  const [coverLetterOpened, { open: openCoverLetter, close: closeCoverLetter }] =
    useDisclosure(false);
  const [customInstructionOpened, { open: openCustomInstruction, close: closeCustomInstruction }] =
    useDisclosure(false);
  const [loadingJobs, setLoadingJobs] = useState({});
  const [customInstruction, setCustomInstruction] = useState('');
  const [currentJobDetails, setCurrentJobDetails] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [availableLanguages, setAvailableLanguages] = useState([
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish (Español)' },
    { value: 'fr', label: 'French (Français)' },
    { value: 'de', label: 'German (Deutsch)' },
  ]);

  // Motivational letter states
  const [motivationalLetter, setMotivationalLetter] = useState('');
  const [
    motivationalLetterOpened,
    { open: openMotivationalLetter, close: closeMotivationalLetter },
  ] = useDisclosure(false);
  const [loadingMotivation, setLoadingMotivation] = useState({});
  const [
    motivationCustomInstructionOpened,
    { open: openMotivationCustomInstruction, close: closeMotivationCustomInstruction },
  ] = useDisclosure(false);

  // Interview preparation state
  const [interviewPrepOpened, setInterviewPrepOpened] = useState(false);
  const [currentInterviewJob, setCurrentInterviewJob] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Memoize the handleApiError function to prevent useEffect reruns
  const handleApiError = useCallback(
    (error) => {
      console.error('API Error:', error);

      // Check if it's an API key validation error
      if (error.response && error.response.status === 401) {
        setApiError('Your API key appears to be invalid or expired. Please provide a new API key.');
        refreshApiKeyStatus(); // This will check if the API key is still valid
        return;
      }

      // Other error handling
      const errorMessage = error.response?.data?.error || 'An error occurred. Please try again.';
      setApiError(errorMessage);
    },
    [refreshApiKeyStatus]
  );

  // Fetch available languages when component mounts
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const apiKey = getApiKey();
        if (!apiKey) {
          return;
        }

        const response = await axios.get(getApiUrl('supported-languages'), {
          headers: {
            'X-API-KEY': apiKey,
          },
        });

        if (response.data.success) {
          const formattedLanguages = response.data.languages.map((lang) => ({
            value: lang.code,
            label: lang.name,
          }));
          setAvailableLanguages(formattedLanguages);
        }
      } catch (error) {
        console.error('Error fetching supported languages:', error);
        // We'll keep the default languages already set
        handleApiError(error);
      }
    };

    fetchLanguages();

    // Load saved language preference if available
    const savedLanguage = localStorage.getItem('defaultLanguage');
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
  }, [handleApiError]);

  // Make sure results is treated as an array
  if (!results || !Array.isArray(results) || results.length === 0) return null;

  // Check if we have a valid API key
  if (!hasApiKey) {
    return (
      <Paper p="xl" withBorder>
        <Stack align="center" spacing="md">
          <IconAlertCircle size={48} color="red" />
          <Title order={3} align="center">
            API Key Required
          </Title>
          <Text align="center">
            Your API key is missing or invalid. Please refresh the page and enter a valid Google
            Gemini API key.
          </Text>
        </Stack>
      </Paper>
    );
  }

  const handleGenerateCoverLetter = async (job, instruction = '') => {
    const jobId = job.job_title + job.company_name;
    setLoadingJobs((prev) => ({ ...prev, [jobId]: true }));
    setApiError(null);

    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('No API key available');
      }

      const response = await axios.post(
        getApiUrl('cover-letter'),
        {
          company_name: job.company_name,
          job_title: job.job_title,
          job_description: job.job_description || '',
          job_link: job.job_link || '',
          custom_instruction: instruction,
          language: selectedLanguage,
        },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );

      if (response.data.success) {
        setCoverLetter(response.data.cover_letter);
        openCoverLetter();
      } else {
        throw new Error(response.data.error || 'Failed to generate cover letter');
      }
    } catch (error) {
      console.error('Error generating cover letter:', error);
      handleApiError(error);
    } finally {
      setLoadingJobs((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const handleGenerateMotivationalLetter = async (job, instruction = '') => {
    const jobId = job.job_title + job.company_name;
    setLoadingMotivation((prev) => ({ ...prev, [jobId]: true }));
    setApiError(null);

    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('No API key available');
      }

      const response = await axios.post(
        getApiUrl('motivational-letter'),
        {
          job_title: job.job_title,
          company_name: job.company_name,
          job_description: job.job_description || '',
          custom_instruction: instruction,
        },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );

      if (response.data.success) {
        setMotivationalLetter(response.data.letter);
        openMotivationalLetter();
      } else {
        throw new Error(response.data.error || 'Failed to generate motivational letter');
      }
    } catch (error) {
      console.error('Error generating motivational letter:', error);
      handleApiError(error);
    } finally {
      setLoadingMotivation((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const handleOpenCustomInstruction = (job) => {
    setCurrentJobDetails(job);
    setCustomInstruction('');
    openCustomInstruction();
  };

  const handleSubmitCustomInstruction = () => {
    closeCustomInstruction();
    if (currentJobDetails) {
      handleGenerateCoverLetter(currentJobDetails, customInstruction);
    }
  };

  const handleOpenMotivationCustomInstruction = (job) => {
    setCurrentJobDetails(job);
    setCustomInstruction('');
    openMotivationCustomInstruction();
  };

  const handleSubmitMotivationCustomInstruction = () => {
    closeMotivationCustomInstruction();
    if (currentJobDetails) {
      handleGenerateMotivationalLetter(currentJobDetails, customInstruction);
    }
  };

  // Handle opening the interview preparation modal
  const handleOpenInterviewPrep = (job) => {
    setCurrentInterviewJob(job);
    setInterviewPrepOpened(true);
  };

  // Handle closing the interview preparation modal
  const handleCloseInterviewPrep = () => {
    setInterviewPrepOpened(false);
    setCurrentInterviewJob(null);
  };

  const truncateUrl = (url) => {
    if (!url) return '';
    try {
      const maxLength = 60;
      if (url.length <= maxLength) return url;
      return url.substring(0, 30) + '...' + url.substring(url.length - 27);
    } catch (error) {
      return url;
    }
  };

  // Get language label for display
  const getLanguageLabel = (code) => {
    const language = availableLanguages.find((lang) => lang.value === code);
    return language ? language.label : 'English';
  };

  return (
    <Stack spacing="xl">
      {apiError && (
        <Paper p="md" withBorder sx={{ backgroundColor: '#FFEAEA', borderColor: '#FF6B6B' }}>
          <Group spacing="sm">
            <IconAlertCircle size={24} color="#FF0000" />
            <Text weight={500} color="#D10000">
              {apiError}
            </Text>
          </Group>
        </Paper>
      )}

      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Stack spacing="md">
          <Title order={2} align="center" color="blue">
            Analysis Results
          </Title>
          <Text align="center" color="dimmed">
            We&apos;ve analyzed your resume against the job details you provided
          </Text>
          <Divider />
        </Stack>
      </Paper>

      {results.map((job, index) => (
        <Paper key={index} shadow="md" radius="md" p="xl" withBorder>
          <Stack spacing="lg">
            {/* Job Header Section */}
            <Stack spacing={4}>
              <Group position="apart" align="center">
                <Text size="xl" weight={700} color="blue">
                  {job.job_title}
                </Text>
                <Badge
                  size="xl"
                  color={
                    job.match_percentage >= 80
                      ? 'green'
                      : job.match_percentage >= 60
                        ? 'yellow'
                        : 'red'
                  }
                >
                  {job.match_percentage}% MATCH
                </Badge>
              </Group>
              <Group>
                <Text size="lg" weight={600}>
                  {job.company_name}
                </Text>

                {job.job_link && (
                  <Tooltip label={job.job_link} position="top">
                    <Text size="sm" color="dimmed" style={{ cursor: 'pointer' }}>
                      {truncateUrl(job.job_link)}
                    </Text>
                  </Tooltip>
                )}
              </Group>
            </Stack>

            <Divider />

            {/* Matching Skills */}
            <div>
              <Text weight={600} size="md" mb="xs">
                Matching Skills:
              </Text>
              {job.matching_skills && job.matching_skills.length > 0 ? (
                <Group spacing="xs">
                  {job.matching_skills.map((skill, i) => (
                    <Badge key={i} variant="dot" color="green" size="lg">
                      {skill}
                    </Badge>
                  ))}
                </Group>
              ) : (
                <Text color="dimmed" size="sm">
                  No matching skills found
                </Text>
              )}
            </div>

            {/* Missing Skills */}
            <div>
              <Text weight={600} size="md" mb="xs">
                Skills to Develop:
              </Text>
              {job.missing_skills && job.missing_skills.length > 0 ? (
                <Group spacing="xs">
                  {job.missing_skills.map((skill, i) => (
                    <Badge key={i} variant="dot" color="red" size="lg">
                      {skill}
                    </Badge>
                  ))}
                </Group>
              ) : (
                <Text color="dimmed" size="sm">
                  No missing skills - Great match!
                </Text>
              )}
            </div>

            {/* Recommendations */}
            <div>
              <Text weight={600} size="md" mb="xs">
                Recommendations:
              </Text>
              {job.recommendations && job.recommendations.length > 0 ? (
                <List size="sm" spacing="xs">
                  {job.recommendations.map((rec, i) => (
                    <List.Item key={i}>{rec}</List.Item>
                  ))}
                </List>
              ) : (
                <Text color="dimmed" size="sm">
                  No specific recommendations - Your profile matches well!
                </Text>
              )}
            </div>

            <Divider />

            {/* Action Buttons - Grid Layout */}
            <Grid>
              <Grid.Col span={6}>
                {/* Cover Letter Button Group */}
                <Menu position="bottom-start" withinPortal>
                  <Menu.Target>
                    <Button.Group style={{ width: '100%' }}>
                      <Button
                        variant="gradient"
                        gradient={{ from: '#662D8C', to: '#ED1E79' }}
                        onClick={() => handleGenerateCoverLetter(job)}
                        loading={loadingJobs[job.job_title + job.company_name]}
                        style={{ flexGrow: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                        leftIcon={<IconFileText size={16} />}
                      >
                        Generate Cover Letter
                      </Button>
                      <Button
                        variant="filled"
                        style={{
                          flexGrow: 0,
                          paddingLeft: '8px',
                          paddingRight: '8px',
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
                          backgroundColor: '#ED1E79',
                        }}
                      >
                        <Group spacing={2}>
                          <IconLanguage size={16} />
                          <IconChevronDown size={16} />
                        </Group>
                      </Button>
                    </Button.Group>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>Select Language</Menu.Label>
                    {availableLanguages.map((lang) => (
                      <Menu.Item
                        key={lang.value}
                        onClick={() => setSelectedLanguage(lang.value)}
                        icon={lang.value === selectedLanguage ? '✓' : null}
                      >
                        {lang.label}
                      </Menu.Item>
                    ))}
                    <Menu.Divider />
                    <Menu.Item
                      icon={<IconPlus size={14} />}
                      onClick={() => handleOpenCustomInstruction(job)}
                    >
                      Custom Instructions
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Grid.Col>

              <Grid.Col span={6}>
                {/* Motivational Letter Button */}
                <Button.Group style={{ width: '100%' }}>
                  <Button
                    variant="gradient"
                    gradient={{ from: '#D4145A', to: '#FBB03B' }}
                    onClick={() => handleGenerateMotivationalLetter(job)}
                    loading={loadingMotivation[job.job_title + job.company_name]}
                    style={{ flexGrow: 1 }}
                    leftIcon={<IconPencil size={16} />}
                  >
                    Letter of Motivation
                  </Button>
                  <Button
                    variant="filled"
                    style={{
                      flexGrow: 0,
                      paddingLeft: '8px',
                      paddingRight: '8px',
                      borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
                      backgroundColor: '#FBB03B',
                    }}
                    onClick={() => handleOpenMotivationCustomInstruction(job)}
                  >
                    <IconPlus size={16} />
                  </Button>
                </Button.Group>
              </Grid.Col>
            </Grid>

            {/* Second Row of Action Buttons */}
            <Grid>
              <Grid.Col span={6}>
                <ResumeReview
                  jobLink={job.job_link || ''}
                  jobTitle={job.job_title}
                  jobDescription={job.job_description || ''}
                  companyName={job.company_name}
                  resumeFile={resumeFile}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <ATSChecker resumeFile={resumeFile} jobDescription={job.job_description || ''} />
              </Grid.Col>
            </Grid>

            {/* Interview Preparation Button */}
            <Button
              variant="gradient"
              gradient={{ from: '#6a82fb', to: '#FC5C7D' }}
              fullWidth
              leftIcon={<IconMessageCircle size={16} />}
              onClick={() => handleOpenInterviewPrep(job)}
            >
              Interview Preparation
            </Button>

            {/* Learning Resources Button - Always visible but conditionally disabled */}
            <LearningRecommender
              skills={job.missing_skills && job.missing_skills.length > 0 ? job.missing_skills : []}
              title={`Learning Resources for ${job.job_title}`}
              disabled={!job.missing_skills || job.missing_skills.length === 0}
              disabledTooltip="No new skills to learn for this job"
            />
          </Stack>
        </Paper>
      ))}

      {/* Cover Letter Modal */}
      <Modal
        opened={coverLetterOpened}
        onClose={closeCoverLetter}
        title={
          <Group>
            <Text>Generated Cover Letter</Text>
            <Badge color="blue">{getLanguageLabel(selectedLanguage)}</Badge>
          </Group>
        }
        size="lg"
      >
        <Stack>
          <Paper p="md" withBorder>
            <Group position="right" mb="xs">
              <CopyButton value={coverLetter} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip
                    label={copied ? 'Copied' : 'Copy to clipboard'}
                    withArrow
                    position="left"
                  >
                    <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Text style={{ whiteSpace: 'pre-line' }}>{coverLetter}</Text>
          </Paper>
          <Group position="right">
            <Button onClick={closeCoverLetter}>Close</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Motivational Letter Modal */}
      <Modal
        opened={motivationalLetterOpened}
        onClose={closeMotivationalLetter}
        title={
          <Group>
            <Text>Motivational Letter</Text>
            <Badge color="yellow">English</Badge>
          </Group>
        }
        size="lg"
      >
        <Stack>
          <Paper p="md" withBorder>
            <Group position="right" mb="xs">
              <CopyButton value={motivationalLetter} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip
                    label={copied ? 'Copied' : 'Copy to clipboard'}
                    withArrow
                    position="left"
                  >
                    <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Text style={{ whiteSpace: 'pre-line' }}>{motivationalLetter}</Text>
          </Paper>
          <Group position="right">
            <Button onClick={closeMotivationalLetter}>Close</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Custom Instruction Modal for Cover Letter */}
      <Modal
        opened={customInstructionOpened}
        onClose={closeCustomInstruction}
        title="Customize Cover Letter"
        size="md"
      >
        <Stack spacing="md">
          <Text size="sm">Add custom instructions for your cover letter generation:</Text>
          <Textarea
            placeholder="For example: 'Focus on my leadership skills', 'Highlight remote work experience', 'Target this specific role', etc."
            minRows={4}
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.currentTarget.value)}
          />
          <LanguageSelector
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            label="Cover Letter Language"
          />
          <Group position="right">
            <Button variant="outline" onClick={closeCustomInstruction}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCustomInstruction}>Generate Cover Letter</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Custom Instruction Modal for Motivational Letter */}
      <Modal
        opened={motivationCustomInstructionOpened}
        onClose={closeMotivationCustomInstruction}
        title="Customize Motivational Letter"
        size="md"
      >
        <Stack spacing="md">
          <Text size="sm">Add custom instructions for your motivational letter:</Text>
          <Textarea
            placeholder="For example: 'Emphasize my passion for this industry', 'Focus on my career journey', 'Address specific requirements', etc."
            minRows={4}
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.currentTarget.value)}
          />
          <Text size="sm" color="dimmed">
            Letters of Motivation are always generated in English
          </Text>
          <Group position="right">
            <Button variant="outline" onClick={closeMotivationCustomInstruction}>
              Cancel
            </Button>
            <Button onClick={handleSubmitMotivationCustomInstruction}>
              Generate Letter of Motivation
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Interview Preparation Modal */}
      {interviewPrepOpened && currentInterviewJob && (
        <InterviewPreparation jobDetails={currentInterviewJob} onClose={handleCloseInterviewPrep} />
      )}
    </Stack>
  );
};

export default JobResults;
