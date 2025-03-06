import {
  Text,
  Button,
  Stack,
  Badge,
  Modal,
  List,
  Group,
  Paper,
  Flex,
  Textarea,
  Menu,
  ActionIcon,
  CopyButton,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  IconChevronDown,
  IconLanguage,
  IconPlus,
  IconFileDescription,
  IconCopy,
  IconCheck,
} from '@tabler/icons-react';
import ResumeReview from './ResumeReview';
import LanguageSelector from './LanguageSelector';

const JobResults = ({ results, resumeFile, defaultLanguage = 'en' }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [coverLetterOpened, { open: openCoverLetter, close: closeCoverLetter }] =
    useDisclosure(false);
  const [customInstructionOpened, { open: openCustomInstruction, close: closeCustomInstruction }] =
    useDisclosure(false);
  const [loadingJobs, setLoadingJobs] = useState({});
  const [customInstruction, setCustomInstruction] = useState('');
  const [currentJobLink, setCurrentJobLink] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
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
  const [currentJobForMotivation, setCurrentJobForMotivation] = useState(null);

  useEffect(() => {
    // Update selected language when defaultLanguage prop changes
    setSelectedLanguage(defaultLanguage);
  }, [defaultLanguage]);

  // Fetch available languages when component mounts
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get('http://localhost:5050/api/supported-languages');
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
      }
    };

    fetchLanguages();
  }, []);

  if (!results || results.length === 0) return null;

  const handleGenerateCoverLetter = async (jobLink, instruction = '') => {
    setLoadingJobs((prev) => ({ ...prev, [jobLink]: true }));

    try {
      const response = await axios.post('http://localhost:5050/api/cover-letter', {
        job_link: jobLink,
        custom_instruction: instruction,
        language: selectedLanguage,
      });

      if (response.data.success) {
        setCoverLetter(response.data.cover_letter);
        openCoverLetter();
      } else {
        throw new Error(response.data.error || 'Failed to generate cover letter');
      }
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert(error.response?.data?.error || 'Error generating cover letter. Please try again.');
    } finally {
      setLoadingJobs((prev) => ({ ...prev, [jobLink]: false }));
    }
  };

  const handleGenerateMotivationalLetter = async (job, instruction = '') => {
    setLoadingMotivation((prev) => ({ ...prev, [job.job_link]: true }));

    try {
      const response = await axios.post('http://localhost:5050/api/motivational-letter', {
        job_title: job.job_title,
        job_description: job.job_description || '',
        custom_instruction: instruction,
        language: selectedLanguage,
      });

      if (response.data.success) {
        setMotivationalLetter(response.data.letter);
        openMotivationalLetter();
      } else {
        throw new Error(response.data.error || 'Failed to generate motivational letter');
      }
    } catch (error) {
      console.error('Error generating motivational letter:', error);
      alert(
        error.response?.data?.error || 'Error generating motivational letter. Please try again.'
      );
    } finally {
      setLoadingMotivation((prev) => ({ ...prev, [job.job_link]: false }));
    }
  };

  const handleOpenCustomInstruction = (jobLink) => {
    setCurrentJobLink(jobLink);
    setCustomInstruction('');
    openCustomInstruction();
  };

  const handleSubmitCustomInstruction = () => {
    closeCustomInstruction();
    handleGenerateCoverLetter(currentJobLink, customInstruction);
  };

  const handleOpenMotivationCustomInstruction = (job) => {
    setCurrentJobForMotivation(job);
    setCustomInstruction('');
    openMotivationCustomInstruction();
  };

  const handleSubmitMotivationCustomInstruction = () => {
    closeMotivationCustomInstruction();
    if (currentJobForMotivation) {
      handleGenerateMotivationalLetter(currentJobForMotivation, customInstruction);
    }
  };

  const truncateUrl = (url) => {
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
    <Stack spacing="md">
      <Text size="xl" weight={700}>
        Analysis Results
      </Text>

      {results.map((job, index) => (
        <Paper key={index} shadow="xs" p="md" withBorder>
          <Stack spacing="sm">
            {/* Job Header Section */}
            <Stack spacing={4}>
              <Group position="apart" align="center">
                <Text size="lg" weight={600} color="blue">
                  {job.job_title}
                </Text>
                <Badge
                  color={
                    job.match_percentage >= 80
                      ? 'green'
                      : job.match_percentage >= 60
                        ? 'yellow'
                        : 'red'
                  }
                  size="lg"
                >
                  {job.match_percentage}% MATCH
                </Badge>
              </Group>
              <Flex gap="xs" align="center">
                <Text size="md" weight={500}>
                  {job.company_name}
                </Text>
                <Text size="sm" color="dimmed">
                  •
                </Text>
                <Text size="sm" color="dimmed">
                  {job.platform || 'Job Board'}
                </Text>
              </Flex>
              <Text size="sm" color="dimmed" style={{ wordBreak: 'break-all' }}>
                {truncateUrl(job.job_link)}
              </Text>
            </Stack>

            {/* Matching Skills */}
            <div>
              <Text weight={500} size="sm" mb="xs">
                Matching Skills:
              </Text>
              {job.matching_skills && job.matching_skills.length > 0 ? (
                <Group spacing="xs">
                  {job.matching_skills.map((skill, i) => (
                    <Badge key={i} variant="dot" color="green">
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
              <Text weight={500} size="sm" mb="xs">
                Skills to Develop:
              </Text>
              {job.missing_skills && job.missing_skills.length > 0 ? (
                <Group spacing="xs">
                  {job.missing_skills.map((skill, i) => (
                    <Badge key={i} variant="dot" color="red">
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
              <Text weight={500} size="sm" mb="xs">
                Recommendations:
              </Text>
              {job.recommendations && job.recommendations.length > 0 ? (
                <List size="sm">
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

            {/* Action Buttons */}
            <Group grow>
              {/* Cover Letter Button Group */}
              <Menu position="bottom-start" withinPortal>
                <Menu.Target>
                  <Button.Group style={{ flexGrow: 1 }}>
                    <Button
                      variant="light"
                      color="blue"
                      onClick={() => handleGenerateCoverLetter(job.job_link)}
                      loading={loadingJobs[job.job_link]}
                      style={{ flexGrow: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    >
                      Generate Cover Letter
                    </Button>
                    <Button
                      variant="light"
                      color="blue"
                      style={{
                        flexGrow: 0,
                        paddingLeft: '8px',
                        paddingRight: '8px',
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
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
                    onClick={() => handleOpenCustomInstruction(job.job_link)}
                  >
                    Custom Instructions
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>

              {/* Motivational Letter Button Group */}
              <Menu position="bottom-start" withinPortal>
                <Menu.Target>
                  <Button.Group style={{ flexGrow: 1 }}>
                    <Button
                      variant="light"
                      color="yellow"
                      onClick={() => handleGenerateMotivationalLetter(job)}
                      loading={loadingMotivation[job.job_link]}
                      style={{ flexGrow: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                      leftIcon={<IconFileDescription size={16} />}
                    >
                      Generate Motivational Letter
                    </Button>
                    <Button
                      variant="light"
                      color="yellow"
                      style={{
                        flexGrow: 0,
                        paddingLeft: '8px',
                        paddingRight: '8px',
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
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
                    onClick={() => handleOpenMotivationCustomInstruction(job)}
                  >
                    Custom Instructions
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>

            <Group grow>
              <ResumeReview jobLink={job.job_link} resumeFile={resumeFile} />
            </Group>
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
            <Badge color="yellow">{getLanguageLabel(selectedLanguage)}</Badge>
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
          <LanguageSelector
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            label="Motivational Letter Language"
          />
          <Group position="right">
            <Button variant="outline" onClick={closeMotivationCustomInstruction}>
              Cancel
            </Button>
            <Button onClick={handleSubmitMotivationCustomInstruction}>
              Generate Motivational Letter
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default JobResults;
