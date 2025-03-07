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
  Grid,
  Divider,
  RingProgress,
  ThemeIcon,
  Accordion,
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
  IconX,
  IconBulb,
  IconSchool,
  IconAlertTriangle,
  IconFileCheck,
} from '@tabler/icons-react';
import ResumeReview from './ResumeReview';
import LanguageSelector from './LanguageSelector';
import ATSChecker from './ATSChecker';
import LearningRecommender from './LearningRecommender';

const JobResults = ({ results, resumeFile, defaultLanguage = 'en', ats_analysis = null }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [coverLetterOpened, { open: openCoverLetter, close: closeCoverLetter }] =
    useDisclosure(false);
  const [customInstructionOpened, { open: openCustomInstruction, close: closeCustomInstruction }] =
    useDisclosure(false);
  const [loadingJobs, setLoadingJobs] = useState({});
  const [customInstruction, setCustomInstruction] = useState('');
  const [currentJobLink, setCurrentJobLink] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [availableLanguages, setAvailableLanguages] = useState([
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish (Español)' },
    { value: 'fr', label: 'French (Français)' },
    { value: 'de', label: 'German (Deutsch)' },
  ]);

  // ATS States
  const [atsModalOpened, { open: openAtsModal, close: closeAtsModal }] = useDisclosure(false);
  const [atsResults, setAtsResults] = useState(null);

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
    // Update selected language from localStorage first, then from props if needed
    const savedLanguage = localStorage.getItem('defaultLanguage');
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    } else if (defaultLanguage) {
      setSelectedLanguage(defaultLanguage);
    } else {
      // Default to English if nothing else is set
      setSelectedLanguage('en');
    }
    
    // Also update when defaultLanguage changes
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

  // Check for ATS results from props
  useEffect(() => {
    if (ats_analysis) {
      setAtsResults(ats_analysis);
    }
  }, [ats_analysis]);

  // Make sure results is treated as an array
  if (!results || !Array.isArray(results) || results.length === 0) return null;

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

  // Functions for ATS Results Display
  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const renderAtsScoreRing = () => {
    if (!atsResults) return null;

    const score = atsResults.ats_score;
    const color = getScoreColor(score);

    return (
      <Stack align="center" spacing="xs">
        <RingProgress
          sections={[{ value: score, color }]}
          label={
            <Text size="xl" weight={700} align="center">
              {score}%
            </Text>
          }
          size={140}
          thickness={14}
        />
        <Text size="sm" color="dimmed" align="center" mt="xs">
          ATS Compatibility Score
        </Text>
        <Badge color={color} size="lg" mt="sm">
          {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
        </Badge>
      </Stack>
    );
  };

  const renderAtsIssuesLists = () => {
    if (!atsResults) return null;

    return (
      <Stack spacing="md">
        <Paper withBorder p="md" radius="md">
          <Stack spacing="md">
            <Text weight={500}>Format Issues</Text>
            <List
              spacing="xs"
              size="sm"
              center
              icon={
                <ThemeIcon color="red" size={24} radius="xl">
                  <IconX size={16} />
                </ThemeIcon>
              }
            >
              {atsResults.format_issues && atsResults.format_issues.length > 0 ? (
                atsResults.format_issues.map((issue, index) => (
                  <List.Item key={index}>{issue}</List.Item>
                ))
              ) : (
                <Text color="dimmed">No format issues detected.</Text>
              )}
            </List>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Stack spacing="md">
            <Text weight={500}>Content Issues</Text>
            <List
              spacing="xs"
              size="sm"
              center
              icon={
                <ThemeIcon color="red" size={24} radius="xl">
                  <IconX size={16} />
                </ThemeIcon>
              }
            >
              {atsResults.content_issues && atsResults.content_issues.length > 0 ? (
                atsResults.content_issues.map((issue, index) => (
                  <List.Item key={index}>{issue}</List.Item>
                ))
              ) : (
                <Text color="dimmed">No content issues detected.</Text>
              )}
            </List>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Stack spacing="md">
            <Text weight={500}>Keyword Issues</Text>
            <List
              spacing="xs"
              size="sm"
              center
              icon={
                <ThemeIcon color="red" size={24} radius="xl">
                  <IconX size={16} />
                </ThemeIcon>
              }
            >
              {atsResults.keyword_issues && atsResults.keyword_issues.length > 0 ? (
                atsResults.keyword_issues.map((issue, index) => (
                  <List.Item key={index}>{issue}</List.Item>
                ))
              ) : (
                <Text color="dimmed">No keyword issues detected.</Text>
              )}
            </List>
          </Stack>
        </Paper>
      </Stack>
    );
  };

  const renderAtsSuggestions = () => {
    if (!atsResults) return null;

    return (
      <Paper withBorder p="md" radius="md">
        <Stack spacing="md">
          <Group position="apart">
            <Text weight={500}>Improvement Suggestions</Text>
          </Group>
          <List
            spacing="xs"
            size="sm"
            center
            icon={
              <ThemeIcon color="blue" size={24} radius="xl">
                <IconBulb size={16} />
              </ThemeIcon>
            }
          >
            {atsResults.improvement_suggestions.map((suggestion, index) => (
              <List.Item key={index}>{suggestion}</List.Item>
            ))}
          </List>
        </Stack>
      </Paper>
    );
  };

  const renderAtsGoodPractices = () => {
    if (!atsResults) return null;

    return (
      <Paper withBorder p="md" radius="md">
        <Stack spacing="md">
          <Group position="apart">
            <Text weight={500}>Good Practices</Text>
          </Group>
          <List
            spacing="xs"
            size="sm"
            center
            icon={
              <ThemeIcon color="green" size={24} radius="xl">
                <IconCheck size={16} />
              </ThemeIcon>
            }
          >
            {atsResults.good_practices && atsResults.good_practices.length > 0 ? (
              atsResults.good_practices.map((practice, index) => (
                <List.Item key={index}>{practice}</List.Item>
              ))
            ) : (
              <Text color="dimmed">No good practices detected.</Text>
            )}
          </List>
        </Stack>
      </Paper>
    );
  };

  return (
    <Stack spacing="md">
      <Text size="xl" weight={700}>
        Analysis Results
      </Text>

      {/* ATS Results Summary (If Available) */}
      {atsResults && (
        <Paper shadow="sm" radius="md" p="xl" withBorder>
          <Stack spacing="md">
            <Group position="apart" align="flex-start">
              <div>
                <Text size="lg" weight={700}>
                  ATS Compatibility: {atsResults.summary}
                </Text>
                <Text color="dimmed" size="sm">
                  Based on analysis of your resume format and content
                </Text>
              </div>
              {renderAtsScoreRing()}
            </Group>

            <Group position="right">
              <Button
                variant="light"
                color="cyan"
                onClick={openAtsModal}
                leftIcon={<IconFileCheck size={16} />}
              >
                View Detailed ATS Report
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}

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

            <Divider />

            {/* Action Buttons - First Row */}
            <Grid>
              <Grid.Col span={6}>
                {/* Cover Letter Button Group */}
                <Menu position="bottom-start" withinPortal>
                  <Menu.Target>
                    <Button.Group style={{ width: '100%' }}>
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
              </Grid.Col>

              <Grid.Col span={6}>
                {/* Motivational Letter Button */}
                <Button.Group style={{ width: '100%' }}>
                  <Button
                    variant="light"
                    color="yellow"
                    onClick={() => handleGenerateMotivationalLetter(job)}
                    loading={loadingMotivation[job.job_link]}
                    style={{ flexGrow: 1 }}
                    leftIcon={<IconFileDescription size={16} />}
                  >
                    Motivational Letter
                  </Button>
                  <Button
                    variant="light"
                    color="yellow"
                    style={{
                      flexGrow: 0,
                      paddingLeft: '8px',
                      paddingRight: '8px',
                      borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
                    }}
                    onClick={() => handleOpenMotivationCustomInstruction(job)}
                  >
                    <IconPlus size={16} />
                  </Button>
                </Button.Group>
              </Grid.Col>
            </Grid>

            {/* Action Buttons - Second Row */}
            <Grid>
              <Grid.Col span={6}>
                <ResumeReview jobLink={job.job_link} resumeFile={resumeFile} />
              </Grid.Col>
              <Grid.Col span={6}>
                <ATSChecker resumeFile={resumeFile} jobDescription={job.job_description} />
              </Grid.Col>
            </Grid>

            {/* Learning Resources */}
            {job.missing_skills && job.missing_skills.length > 0 && (
              <LearningRecommender
                skills={job.missing_skills}
                title={`Learning Resources for ${job.job_title}`}
              />
            )}
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
            Motivational letters are always generated in English
          </Text>
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

      {/* ATS Detailed Report Modal */}
      <Modal
        opened={atsModalOpened}
        onClose={closeAtsModal}
        title="ATS Compatibility Report"
        size="lg"
        scrollAreaComponent={Modal.ScrollArea}
      >
        {atsResults && (
          <Stack spacing="md">
            <Group position="apart" align="flex-start">
              <div>
                <Text size="lg" weight={700}>
                  {atsResults.summary}
                </Text>
                <Text color="dimmed" size="sm">
                  Based on analysis of your resume format and content
                </Text>
              </div>
              {renderAtsScoreRing()}
            </Group>

            <Divider />

            {/* ATS Issue Reports */}
            {renderAtsIssuesLists()}
            {renderAtsSuggestions()}
            {renderAtsGoodPractices()}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
};

export default JobResults;
