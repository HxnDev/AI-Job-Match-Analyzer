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
} from '@tabler/icons-react';
import axios from 'axios';

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

  const handleGetRecommendations = async () => {
    // Add fallback skills if none provided or empty array
    const skillsToUse =
      skills && skills.length > 0 ? skills : ['Programming', 'Project Management', 'Communication'];

    setLoading(true);
    setError(null);
    try {
      console.log('Requesting learning recommendations for skills:', skillsToUse);
      const response = await axios.post('http://localhost:5050/api/learning-recommendations', {
        skills: skillsToUse,
      });

      console.log('Received response:', response.data);

      if (response.data.success && response.data.recommendations) {
        setRecommendations(response.data.recommendations);
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
    setDetailedPlanLoading(true);
    setDetailedSkill(skill);
    setError(null);
    setActiveTab('detailed');

    try {
      console.log('Requesting detailed learning plan for skill:', skill);
      const response = await axios.post('http://localhost:5050/api/learning-plan', {
        skill,
      });

      console.log('Received detailed plan response:', response.data);

      if (response.data.success && response.data.learning_plan) {
        setDetailedPlan(response.data.learning_plan);
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
        {course.url && (
          <Anchor href={course.url} target="_blank" size="sm">
            Visit Platform
          </Anchor>
        )}
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
      {article.url && (
        <Group position="right" mt="xs">
          <Anchor href={article.url} target="_blank" size="sm">
            View Source
          </Anchor>
        </Group>
      )}
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
      {video.url && (
        <Group position="right" mt="xs">
          <Anchor href={video.url} target="_blank" size="sm">
            Watch on {video.platform}
          </Anchor>
        </Group>
      )}
    </Card>
  );

  const renderSkillRecommendations = (skillData) => (
    <Paper withBorder p="md" radius="md" mb="md">
      <Group position="apart">
        <Group>
          <Badge size="lg" color="blue">
            {skillData.skill}
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
              onClick={() => handleGetDetailedPlan(skillData.skill)}
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
            <Title order={3}>{detailedPlan.skill}</Title>
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
                              <Text weight={500} size="sm">
                                {resource.title}
                              </Text>
                              <Text size="xs" color="dimmed">
                                {resource.type} • {resource.source}
                              </Text>
                              <Text size="xs">{resource.description}</Text>
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
                            <List.Item key={idx}>{project}</List.Item>
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

  const button = (
    <Tooltip
      label={disabled ? disabledTooltip : 'Get personalized learning resources'}
      position="top"
      disabled={!disabled}
    >
      <div style={{ width: '100%' }}>
        {' '}
        {/* Wrapper div to make tooltip work with disabled button */}
        <Button
          onClick={handleGetRecommendations}
          loading={loading}
          leftIcon={<IconSchool size={16} />}
          color="violet"
          variant="gradient"
          gradient={{ from: 'indigo', to: 'violet' }}
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
