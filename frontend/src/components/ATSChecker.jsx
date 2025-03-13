import React, { useState, useContext } from 'react';
import {
  Button,
  Modal,
  Stack,
  Text,
  Group,
  Paper,
  RingProgress,
  List,
  ThemeIcon,
  Accordion,
  Tabs,
  Badge,
  ActionIcon,
  Tooltip,
  Divider,
  CopyButton,
  Alert,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconCheck,
  IconX,
  IconBulb,
  IconAlertTriangle,
  IconFileCheck,
  IconCopy,
  IconRobot,
  IconAlertCircle,
} from '@tabler/icons-react';
import axios from 'axios';
import { getApiUrl, getApiKey } from '../utils/apiConfig';
import { ApiKeyContext } from '../App';

const ATSChecker = ({ resumeFile, jobDescription }) => {
  const { hasApiKey, refreshApiKeyStatus } = useContext(ApiKeyContext);
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [atsResults, setAtsResults] = useState(null);
  const [optimizedSections, setOptimizedSections] = useState(null);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleATSCheck = async () => {
    if (!resumeFile) {
      setError('Please upload a resume first');
      return;
    }

    if (!hasApiKey) {
      setError('API key is missing or invalid. Please refresh the page and enter a valid API key.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('No API key available');
      }

      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await axios.post(getApiUrl('ats-check'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-API-KEY': apiKey,
        },
      });

      if (response.data.success) {
        setAtsResults(response.data.analysis);
        open();
      } else {
        throw new Error(response.data.error || 'Failed to analyze ATS compatibility');
      }
    } catch (error) {
      console.error('Error checking ATS compatibility:', error);

      // Check if it's an API key issue
      if (error.response && error.response.status === 401) {
        setError('Your API key appears to be invalid. Please refresh and enter a new key.');
        refreshApiKeyStatus(); // This will check if the API key is still valid
      } else {
        setError(
          error.response?.data?.error || 'Error checking ATS compatibility. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeResume = async () => {
    if (!resumeFile) {
      setError('Please upload a resume first');
      return;
    }

    if (!jobDescription) {
      setError('Please provide a job description to optimize your resume');
      return;
    }

    if (!hasApiKey) {
      setError('API key is missing or invalid. Please refresh the page and enter a valid API key.');
      return;
    }

    setOptimizeLoading(true);
    setError(null);

    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('No API key available');
      }

      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('job_description', jobDescription);

      const response = await axios.post(getApiUrl('ats-optimize'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-API-KEY': apiKey,
        },
      });

      if (response.data.success) {
        setOptimizedSections(response.data.optimized_sections);
      } else {
        throw new Error(response.data.error || 'Failed to optimize resume');
      }
    } catch (error) {
      console.error('Error optimizing resume:', error);

      // Check if it's an API key issue
      if (error.response && error.response.status === 401) {
        setError('Your API key appears to be invalid. Please refresh and enter a new key.');
        refreshApiKeyStatus(); // This will check if the API key is still valid
      } else {
        setError(error.response?.data?.error || 'Error optimizing resume. Please try again.');
      }
    } finally {
      setOptimizeLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const renderScoreRing = () => {
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

  const renderIssuesLists = () => {
    if (!atsResults) return null;

    return (
      <Tabs defaultValue="format">
        <Tabs.List>
          <Tabs.Tab value="format" icon={<IconFileCheck size={14} />}>
            Format Issues
          </Tabs.Tab>
          <Tabs.Tab value="content" icon={<IconAlertTriangle size={14} />}>
            Content Issues
          </Tabs.Tab>
          <Tabs.Tab value="keywords" icon={<IconBulb size={14} />}>
            Keyword Issues
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="format" pt="xs">
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
        </Tabs.Panel>

        <Tabs.Panel value="content" pt="xs">
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
        </Tabs.Panel>

        <Tabs.Panel value="keywords" pt="xs">
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
        </Tabs.Panel>
      </Tabs>
    );
  };

  const renderSuggestions = () => {
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

  const renderGoodPractices = () => {
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

  const renderOptimizedSections = () => {
    if (!optimizedSections) return null;

    return (
      <Stack spacing="md">
        <Paper withBorder p="md" radius="md">
          <Stack spacing="xs">
            <Group position="apart">
              <Text weight={500}>Professional Summary</Text>
              <CopyButton value={optimizedSections.professional_summary} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                    <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Text size="sm">{optimizedSections.professional_summary}</Text>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Stack spacing="xs">
            <Group position="apart">
              <Text weight={500}>Skills Section</Text>
              <CopyButton value={optimizedSections.skills_section.join(', ')} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                    <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Group spacing="xs">
              {optimizedSections.skills_section.map((skill, index) => (
                <Badge key={index}>{skill}</Badge>
              ))}
            </Group>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Stack spacing="xs">
            <Group position="apart">
              <Text weight={500}>Experience Bullets</Text>
              <CopyButton value={optimizedSections.experience_bullets.join('\n• ')} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                    <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <List>
              {optimizedSections.experience_bullets.map((bullet, index) => (
                <List.Item key={index}>{bullet}</List.Item>
              ))}
            </List>
          </Stack>
        </Paper>

        {optimizedSections.keyword_analysis && (
          <Paper withBorder p="md" radius="md">
            <Accordion>
              <Accordion.Item value="keywords">
                <Accordion.Control>
                  <Text weight={500}>Keyword Analysis</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack spacing="md">
                    <div>
                      <Text weight={500} size="sm">
                        Job Keywords
                      </Text>
                      <Group spacing="xs" mt="xs">
                        {optimizedSections.keyword_analysis.job_keywords.map((keyword, index) => (
                          <Badge key={index} color="blue">
                            {keyword}
                          </Badge>
                        ))}
                      </Group>
                    </div>
                    <div>
                      <Text weight={500} size="sm">
                        Missing Keywords
                      </Text>
                      <Group spacing="xs" mt="xs">
                        {optimizedSections.keyword_analysis.missing_keywords.length > 0 ? (
                          optimizedSections.keyword_analysis.missing_keywords.map(
                            (keyword, index) => (
                              <Badge key={index} color="red">
                                {keyword}
                              </Badge>
                            )
                          )
                        ) : (
                          <Text size="sm" color="dimmed">
                            No missing keywords
                          </Text>
                        )}
                      </Group>
                    </div>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Paper>
        )}
      </Stack>
    );
  };

  return (
    <>
      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          mb="md"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Button
        onClick={handleATSCheck}
        loading={loading}
        leftIcon={<IconRobot size={16} />}
        color="cyan"
        variant="gradient"
        gradient={{ from: '#330867', to: '#30cfd0' }}
        fullWidth
      >
        Check ATS Compatibility
      </Button>

      <Modal
        opened={opened}
        onClose={close}
        title="ATS Compatibility Check"
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
              {renderScoreRing()}
            </Group>

            <Divider />

            <Tabs defaultValue="issues">
              <Tabs.List>
                <Tabs.Tab value="issues">Issues & Suggestions</Tabs.Tab>
                <Tabs.Tab
                  value="optimize"
                  onClick={() => !optimizedSections && handleOptimizeResume()}
                >
                  ATS Optimization
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="issues" pt="md">
                <Stack spacing="md">
                  {renderIssuesLists()}
                  {renderSuggestions()}
                  {renderGoodPractices()}
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="optimize" pt="md">
                {optimizeLoading ? (
                  <Stack align="center" py="xl">
                    <Text>Generating optimized content...</Text>
                  </Stack>
                ) : optimizedSections ? (
                  renderOptimizedSections()
                ) : (
                  <Stack spacing="md" align="center" py="md">
                    <Text align="center">
                      Get ATS-optimized versions of your resume sections based on your target job.
                    </Text>
                    <Button
                      onClick={handleOptimizeResume}
                      loading={optimizeLoading}
                      disabled={!jobDescription}
                    >
                      Generate Optimized Content
                    </Button>
                    {!jobDescription && (
                      <Text color="dimmed" size="xs" align="center">
                        Please provide a job description to optimize your resume
                      </Text>
                    )}
                  </Stack>
                )}
              </Tabs.Panel>
            </Tabs>
          </Stack>
        )}
      </Modal>
    </>
  );
};

export default ATSChecker;
