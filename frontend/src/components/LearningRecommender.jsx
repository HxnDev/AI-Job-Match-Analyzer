import React, { useState } from 'react';
import {
  Button,
  Modal,
  Stack,
  Text,
  Group,
  Paper,
  Badge,
  Accordion,
  ThemeIcon,
  List,
  Title,
  Tabs,
  Card,
  Collapse,
  ActionIcon,
  Anchor,
  Loader,
  Box,
  Alert,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBrandYoutube,
  IconSchool,
  IconArticle,
  IconChevronDown,
  IconChevronUp,
  IconArrowRight,
  IconDeviceDesktop,
  IconRocket,
  IconBriefcase,
  IconAlertCircle,
  IconInfoCircle,
  IconExternalLink,
} from '@tabler/icons-react';
import axios from 'axios';
import { getApiUrl, getApiKey } from '../utils/apiConfig';

// Helper function to generate search URLs based on content
const generateSearchUrl = (title, platform) => {
  // Create properly encoded search terms
  const encodedTitle = encodeURIComponent(title);

  // Handle different platforms
  if (platform?.toLowerCase().includes('youtube') || platform === 'YouTube') {
    return `https://www.youtube.com/results?search_query=${encodedTitle}`;
  } else if (platform?.toLowerCase().includes('udemy')) {
    return `https://www.udemy.com/courses/search/?q=${encodedTitle}`;
  } else if (platform?.toLowerCase().includes('coursera')) {
    return `https://www.coursera.org/search?query=${encodedTitle}`;
  } else if (platform?.toLowerCase().includes('pluralsight')) {
    return `https://www.pluralsight.com/search?q=${encodedTitle}`;
  } else if (platform?.toLowerCase().includes('medium')) {
    return `https://medium.com/search?q=${encodedTitle}`;
  } else if (platform?.toLowerCase().includes('tutorial')) {
    return `https://www.google.com/search?q=${encodedTitle}+tutorial`;
  } else {
    // Generic search
    return `https://www.google.com/search?q=${encodedTitle}`;
  }
};

// Helper to check if a URL is valid
const isValidURL = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

// Helper to get a better URL
const getBetterUrl = (url, title, platform) => {
  // Check if URL is missing, generic, or invalid
  if (
    !url ||
    url === 'youtube.com' ||
    url === 'coursera.org' ||
    url === 'medium.com' ||
    !isValidURL(url)
  ) {
    return generateSearchUrl(title, platform);
  }
  return url;
};

// Helper to sanitize skill names (simplify long skills or skills with special characters)
const sanitizeSkill = (skill) => {
  if (!skill) return 'Unknown Skill';

  // If skill contains parentheses with examples, simplify it
  if (skill.includes('(') && skill.includes(')')) {
    // Extract the main skill name before the parenthesis
    const mainSkill = skill.split('(')[0].trim();
    return mainSkill;
  }

  // If skill is too long (over 30 chars), truncate it
  if (skill.length > 30) {
    return skill.substring(0, 30).trim();
  }

  return skill;
};

const LearningRecommender = ({
  skills = [],
  title = 'Learning Recommendations',
  disabled = false,
  disabledTooltip = 'No skills to learn',
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailedPlan, setDetailedPlan] = useState(null);
  const [detailedPlanLoading, setDetailedPlanLoading] = useState(false);
  const [detailedSkill, setDetailedSkill] = useState('');
  const [expandedSkill, setExpandedSkill] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [truncationNotice, setTruncationNotice] = useState(null);

  const handleGetRecommendations = async () => {
    // Prepare a list of sanitized skills
    const originalSkills =
      skills && skills.length > 0 ? skills : ['Programming', 'Project Management', 'Communication'];

    // Create a mapping between original and sanitized skills for display
    const skillMap = {};
    const sanitizedSkills = originalSkills.map((skill) => {
      const sanitized = sanitizeSkill(skill);
      skillMap[sanitized] = skill; // Store original skill for reference
      return sanitized;
    });

    const originalSkillCount = sanitizedSkills.length;

    // Limit to maximum 3 skills to be extra safe
    const hasExcessSkills = sanitizedSkills.length > 3;
    let skillsToUse = sanitizedSkills;

    if (hasExcessSkills) {
      const truncatedSkills = sanitizedSkills.slice(0, 3);
      const excessSkills = originalSkills.slice(3).map((s) => skillMap[s] || s);

      // Update truncation notice with original skill names
      setTruncationNotice({
        original: originalSkillCount,
        displayed: 3,
        skills: truncatedSkills.map((s) => skillMap[s] || s),
        excess: excessSkills,
        message: `Showing recommendations for the first 3 skills out of ${originalSkillCount} due to system limitations.`,
      });

      skillsToUse = truncatedSkills;
    } else {
      setTruncationNotice(null);
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Requesting learning recommendations for skills:', skillsToUse);

      // Get API key from storage
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('No API key available');
      }

      const response = await axios.post(
        getApiUrl('learning-recommendations'),
        {
          skills: skillsToUse,
        },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );

      console.log('Received response:', response.data);

      if (response.data.success && response.data.recommendations) {
        // Map sanitized skill names back to original skills for display
        const enhancedRecommendations = response.data.recommendations.map((rec) => {
          // If we have the original skill name in our map, use it for display
          if (skillMap[rec.skill]) {
            return {
              ...rec,
              displaySkill: skillMap[rec.skill], // Add original skill name for display
              skill: rec.skill, // Keep sanitized skill for internal use
            };
          }
          return rec;
        });

        setRecommendations(enhancedRecommendations);
        open();
      } else {
        throw new Error(response.data.error || 'Failed to get learning recommendations');
      }
    } catch (error) {
      console.error('Error getting learning recommendations:', error);
      setError(
        error.response?.data?.error || 'Error getting learning recommendations. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGetDetailedPlan = async (skill) => {
    // Sanitize the skill before sending to the API
    const sanitizedSkill = sanitizeSkill(skill);

    setDetailedPlanLoading(true);
    setDetailedSkill(skill); // Keep the original skill name for display
    setError(null);
    setActiveTab('detailed');

    try {
      console.log('Requesting detailed learning plan for skill:', sanitizedSkill);

      // Get API key from storage
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('No API key available');
      }

      const response = await axios.post(
        getApiUrl('learning-plan'),
        {
          skill: sanitizedSkill,
        },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );

      console.log('Received detailed plan response:', response.data);

      if (response.data.success && response.data.learning_plan) {
        // Update the skill name in the response to the original skill name for display
        const enhancedPlan = {
          ...response.data.learning_plan,
          displaySkill: skill, // Keep the original skill name for display
        };
        setDetailedPlan(enhancedPlan);
      } else {
        throw new Error(response.data.error || 'Failed to get detailed learning plan');
      }
    } catch (error) {
      console.error('Error getting detailed learning plan:', error);
      setError(
        error.response?.data?.error || 'Error getting detailed learning plan. Please try again.'
      );
    } finally {
      setDetailedPlanLoading(false);
    }
  };

  const toggleSkill = (skill) => {
    setExpandedSkill(expandedSkill === skill ? null : skill);
  };

  const renderCourseCard = (course, index) => (
    <Card key={index} shadow="sm" p="sm" radius="md" withBorder>
      <Group position="apart" noWrap>
        <div>
          <Group>
            <ThemeIcon color="blue" size={24} radius="xl">
              <IconSchool size={16} />
            </ThemeIcon>
            <Text weight={500}>{course.title}</Text>
          </Group>
          <Text size="xs" color="dimmed" mt={4}>
            {course.platform}
          </Text>
        </div>
        <Badge color={course.is_free ? 'green' : 'blue'}>{course.is_free ? 'Free' : 'Paid'}</Badge>
      </Group>
      <Group position="apart" mt="xs">
        <Badge color="gray" variant="outline">
          {course.difficulty}
        </Badge>
        {/* Generate better URLs for course links */}
        <Anchor
          href={getBetterUrl(course.url, course.title, course.platform)}
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
        >
          <Group spacing={4}>
            <span>Visit Platform</span>
            <IconExternalLink size={14} />
          </Group>
        </Anchor>
      </Group>
    </Card>
  );

  const renderArticleCard = (article, index) => (
    <Card key={index} shadow="sm" p="sm" radius="md" withBorder>
      <Group position="apart" noWrap>
        <div>
          <Group>
            <ThemeIcon color="teal" size={24} radius="xl">
              <IconArticle size={16} />
            </ThemeIcon>
            <Text weight={500}>{article.title}</Text>
          </Group>
          <Text size="xs" color="dimmed" mt={4}>
            {article.source}
          </Text>
        </div>
      </Group>
      {/* Generate better URLs for article links */}
      <Group position="right" mt="xs">
        <Anchor
          href={getBetterUrl(article.url, article.title, article.source)}
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
        >
          <Group spacing={4}>
            <span>View Source</span>
            <IconExternalLink size={14} />
          </Group>
        </Anchor>
      </Group>
    </Card>
  );

  const renderVideoCard = (video, index) => (
    <Card key={index} shadow="sm" p="sm" radius="md" withBorder>
      <Group position="apart" noWrap>
        <div>
          <Group>
            <ThemeIcon color="red" size={24} radius="xl">
              <IconBrandYoutube size={16} />
            </ThemeIcon>
            <Text weight={500}>{video.title}</Text>
          </Group>
          <Text size="xs" color="dimmed" mt={4}>
            {video.creator}
          </Text>
        </div>
      </Group>
      {/* Generate better URLs for video links */}
      <Group position="right" mt="xs">
        <Anchor
          href={getBetterUrl(video.url, video.title, video.platform || 'YouTube')}
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
        >
          <Group spacing={4}>
            <span>Watch on {video.platform || 'YouTube'}</span>
            <IconExternalLink size={14} />
          </Group>
        </Anchor>
      </Group>
    </Card>
  );

  const renderSkillRecommendations = (skillData) => (
    <Paper withBorder p="md" radius="md" mb="md">
      <Group position="apart">
        <Group>
          <Badge size="lg" color="blue">
            {/* Use the original skill name for display if available */}
            {skillData.displaySkill || skillData.skill}
          </Badge>
        </Group>
        <ActionIcon variant="subtle" onClick={() => toggleSkill(skillData.skill)}>
          {expandedSkill === skillData.skill ? (
            <IconChevronUp size={16} />
          ) : (
            <IconChevronDown size={16} />
          )}
        </ActionIcon>
      </Group>

      <Collapse in={expandedSkill === skillData.skill}>
        <Stack spacing="md" mt="md">
          <div>
            <Text weight={500} size="sm">
              Courses
            </Text>
            <Stack spacing="xs" mt="xs">
              {skillData.courses && skillData.courses.length > 0 ? (
                skillData.courses.map((course, index) => renderCourseCard(course, index))
              ) : (
                <Text color="dimmed">No courses available</Text>
              )}
            </Stack>
          </div>

          <div>
            <Text weight={500} size="sm">
              Articles & Tutorials
            </Text>
            <Stack spacing="xs" mt="xs">
              {skillData.articles && skillData.articles.length > 0 ? (
                skillData.articles.map((article, index) => renderArticleCard(article, index))
              ) : (
                <Text color="dimmed">No articles available</Text>
              )}
            </Stack>
          </div>

          <div>
            <Text weight={500} size="sm">
              Videos
            </Text>
            <Stack spacing="xs" mt="xs">
              {skillData.videos && skillData.videos.length > 0 ? (
                skillData.videos.map((video, index) => renderVideoCard(video, index))
              ) : (
                <Text color="dimmed">No videos available</Text>
              )}
            </Stack>
          </div>

          <Paper withBorder p="sm" radius="md" bg="gray.0">
            <Group>
              <ThemeIcon color="violet" size={24} radius="xl">
                <IconRocket size={16} />
              </ThemeIcon>
              <Text weight={500} size="sm">
                Learning Path
              </Text>
            </Group>
            <Text size="sm" mt="xs">
              {skillData.learning_path}
            </Text>
          </Paper>

          <Group position="right">
            <Button
              variant="light"
              size="sm"
              rightIcon={<IconArrowRight size={16} />}
              onClick={() => handleGetDetailedPlan(skillData.displaySkill || skillData.skill)}
            >
              Get Detailed Learning Plan
            </Button>
          </Group>
        </Stack>
      </Collapse>
    </Paper>
  );

  const renderDetailedPlan = () => {
    if (!detailedPlan) return null;

    return (
      <Stack spacing="md">
        <Group position="apart">
          <div>
            <Title order={3}>{detailedPlan.displaySkill || detailedPlan.skill}</Title>
            <Text color="dimmed">{detailedPlan.overview}</Text>
          </div>
        </Group>

        <Accordion>
          {detailedPlan.levels &&
            detailedPlan.levels.map((level, index) => (
              <Accordion.Item key={index} value={level.level || `level-${index}`}>
                <Accordion.Control>
                  <Group>
                    <Badge color={index === 0 ? 'green' : index === 1 ? 'blue' : 'violet'}>
                      {level.level || `Level ${index + 1}`}
                    </Badge>
                    <Text>
                      {level.description
                        ? level.description.length > 50
                          ? level.description.substring(0, 50) + '...'
                          : level.description
                        : 'Description unavailable'}
                    </Text>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack spacing="md">
                    <div>
                      <Text weight={500} size="sm">
                        Key Concepts
                      </Text>
                      <Group spacing="xs" mt="xs">
                        {level.key_concepts && level.key_concepts.length > 0 ? (
                          level.key_concepts.map((concept, idx) => (
                            <Badge key={idx} variant="outline">
                              {concept}
                            </Badge>
                          ))
                        ) : (
                          <Text color="dimmed">No key concepts specified</Text>
                        )}
                      </Group>
                    </div>

                    <div>
                      <Text weight={500} size="sm">
                        Recommended Resources
                      </Text>
                      <List mt="xs">
                        {level.resources && level.resources.length > 0 ? (
                          level.resources.map((resource, idx) => (
                            <List.Item key={idx}>
                              <Group position="apart">
                                <div>
                                  <Text weight={500} size="sm">
                                    {resource.title}
                                  </Text>
                                  <Text size="xs" color="dimmed">
                                    {resource.type} • {resource.source}
                                  </Text>
                                  <Text size="xs">{resource.description}</Text>
                                </div>
                                <Anchor
                                  href={generateSearchUrl(resource.title, resource.source)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  size="xs"
                                >
                                  <Group spacing={4}>
                                    <span>Find Resource</span>
                                    <IconExternalLink size={12} />
                                  </Group>
                                </Anchor>
                              </Group>
                            </List.Item>
                          ))
                        ) : (
                          <Text color="dimmed">No resources specified</Text>
                        )}
                      </List>
                    </div>

                    <div>
                      <Text weight={500} size="sm">
                        Projects to Build
                      </Text>
                      <List
                        mt="xs"
                        icon={
                          <ThemeIcon color="blue" size={24} radius="xl">
                            <IconBriefcase size={16} />
                          </ThemeIcon>
                        }
                      >
                        {level.projects && level.projects.length > 0 ? (
                          level.projects.map((project, idx) => (
                            <List.Item key={idx}>
                              <Group position="apart">
                                <Text>{project}</Text>
                                <Anchor
                                  href={generateSearchUrl(
                                    `${detailedPlan.skill} ${project} tutorial`,
                                    null
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  size="xs"
                                >
                                  <Group spacing={4}>
                                    <span>Find Tutorials</span>
                                    <IconExternalLink size={12} />
                                  </Group>
                                </Anchor>
                              </Group>
                            </List.Item>
                          ))
                        ) : (
                          <Text color="dimmed">No projects specified</Text>
                        )}
                      </List>
                    </div>

                    <Group>
                      <IconDeviceDesktop size={16} />
                      <Text size="sm">
                        Estimated Time Investment: {level.estimated_time || 'Not specified'}
                      </Text>
                    </Group>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
        </Accordion>
      </Stack>
    );
  };

  const renderErrorAlert = () => {
    if (!error) return null;

    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
        {error}
      </Alert>
    );
  };

  const renderTruncationNotice = () => {
    if (!truncationNotice) return null;

    return (
      <Alert icon={<IconInfoCircle size={16} />} color="blue" title="Limited Results" mb="md">
        {truncationNotice.message ||
          `Showing recommendations for the first ${truncationNotice.displayed} skills out of ${truncationNotice.original} due to system limitations.`}
        {truncationNotice.excess && truncationNotice.excess.length > 0 && (
          <Text size="sm" mt="xs">
            Skills not shown: {truncationNotice.excess.join(', ')}
          </Text>
        )}
      </Alert>
    );
  };

  // Check if we have too many skills and need to show a warning on the button
  const tooManySkills = skills.length > 3;
  const buttonTooltip = disabled
    ? disabledTooltip
    : tooManySkills
      ? 'Note: Only the first 3 skills will be analyzed due to system limitations'
      : 'Get personalized learning resources';

  const button = (
    <Tooltip label={buttonTooltip} position="top" disabled={!disabled && !tooManySkills}>
      <div style={{ width: '100%' }}>
        {' '}
        {/* Wrapper div to make tooltip work with disabled button */}
        <Button
          onClick={handleGetRecommendations}
          loading={loading}
          leftIcon={<IconSchool size={16} />}
          color="violet"
          variant="gradient"
          gradient={{ from: '#f857a6', to: '#ff5858' }}
          fullWidth
          disabled={disabled}
        >
          Get Learning Resources
        </Button>
      </div>
    </Tooltip>
  );

  return (
    <>
      {button}

      <Modal
        opened={opened}
        onClose={close}
        title={title}
        size="lg"
        scrollAreaComponent={Modal.ScrollArea}
      >
        {loading ? (
          <Stack align="center" py="xl">
            <Loader />
            <Text>Loading recommendations...</Text>
          </Stack>
        ) : (
          <Tabs value={activeTab} onTabChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="recommendations">Recommendations</Tabs.Tab>
              <Tabs.Tab value="detailed" disabled={!detailedPlan}>
                Detailed Plan
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="recommendations" pt="md">
              <Box mt="md">
                {skills && skills.length === 0 && (
                  <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="md">
                    You have all the skills needed for this job! These are general learning
                    resources to help you excel.
                  </Alert>
                )}

                {renderTruncationNotice()}

                {renderErrorAlert()}

                {recommendations && recommendations.length > 0 ? (
                  <>
                    <Text size="sm" color="dimmed" mb="md">
                      Click on a skill to view learning resources and recommendations.
                    </Text>
                    {recommendations.map((skillData) => renderSkillRecommendations(skillData))}
                  </>
                ) : !error ? (
                  <Text color="dimmed">No recommendations available</Text>
                ) : null}
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="detailed" pt="md">
              {detailedPlanLoading ? (
                <Stack align="center" py="xl">
                  <Loader />
                  <Text>Creating detailed learning plan for {detailedSkill}...</Text>
                </Stack>
              ) : (
                <>
                  {renderErrorAlert()}
                  {!error && renderDetailedPlan()}
                </>
              )}
            </Tabs.Panel>
          </Tabs>
        )}
      </Modal>
    </>
  );
};

export default LearningRecommender;
