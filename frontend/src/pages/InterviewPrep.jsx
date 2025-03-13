import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  TextInput,
  Group,
  Button,
  Textarea,
  Badge,
  Card,
  SimpleGrid,
  ThemeIcon,
  Divider,
  Accordion,
  Box,
  Center,
  Alert,
  Loader,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconBriefcase,
  IconBuilding,
  IconSearch,
  IconMessageCircle,
  IconBulb,
  IconChevronRight,
  IconUsers,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import axios from 'axios';

import PageHeader from '../components/PageHeader';
import { MockInterviewFlow } from '../components/InterviewPreparation';
import { InterviewFeedback } from '../components/InterviewPreparation';
import { getApiKey } from '../utils/apiConfig';

/**
 * Standalone page for interview preparation
 * Allows users to enter job details and get interview questions and preparation materials
 */
const InterviewPrep = () => {
  const [loading, setLoading] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [error, setError] = useState(null);
  const [showMockInterview, setShowMockInterview] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState(null);

  // Form for job details
  const form = useForm({
    initialValues: {
      job_title: '',
      company_name: '',
      job_description: '',
    },
    validate: {
      job_title: (value) => (value.trim().length < 2 ? 'Job title is required' : null),
      company_name: (value) => (value.trim().length < 2 ? 'Company name is required' : null),
    },
  });

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);

    try {
      // Get API key from storage
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('No API key available');
      }

      const response = await axios.post(
        'http://localhost:5050/api/interview-preparation',
        {
          job_title: values.job_title,
          company_name: values.company_name,
          job_description: values.job_description,
        },
        {
          headers: {
            'X-API-KEY': apiKey, // Add the API key to headers
          },
        }
      );

      if (response.data.success) {
        setInterviewData(response.data.interview_data);
        notifications.show({
          title: 'Success',
          message: 'Interview questions generated successfully',
          color: 'green',
        });
      } else {
        throw new Error(response.data.error || 'Failed to generate interview questions');
      }
    } catch (error) {
      console.error('Error generating interview questions:', error);
      setError(
        error.response?.data?.error || 'Error generating interview questions. Please try again.'
      );
      notifications.show({
        title: 'Error',
        message: 'Failed to generate interview questions',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Start mock interview
  const handleStartMockInterview = () => {
    if (!interviewData || !interviewData.questions || interviewData.questions.length === 0) {
      notifications.show({
        title: 'No Questions',
        message: 'No interview questions available. Please generate questions first.',
        color: 'yellow',
      });
      return;
    }

    setShowMockInterview(true);
    setShowFeedback(false);
  };

  // Handle interview completion with evaluation results
  const handleInterviewComplete = (results) => {
    setEvaluationResults(results);
    setShowMockInterview(false);
    setShowFeedback(true);
  };

  // Close mock interview
  const handleCloseMockInterview = () => {
    setShowMockInterview(false);
  };

  // Close feedback
  const handleCloseFeedback = () => {
    setShowFeedback(false);
  };

  // Organize questions by category
  const getQuestionsByCategory = () => {
    if (!interviewData || !interviewData.questions) return {};

    const categorized = {};
    interviewData.questions.forEach((question) => {
      const category = question.category || 'General';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(question);
    });

    return categorized;
  };

  // Render category summary cards
  const renderCategorySummary = () => {
    const categorizedQuestions = getQuestionsByCategory();

    return (
      <SimpleGrid cols={3} breakpoints={[{ maxWidth: 'sm', cols: 1 }]} spacing="lg">
        {Object.entries(categorizedQuestions).map(([category, questions]) => (
          <Card key={category} shadow="sm" p="lg" radius="md" withBorder>
            <Group position="apart" mb="xs">
              <Text weight={700}>{category}</Text>
              <Badge color="blue" size="lg">
                {questions.length}
              </Badge>
            </Group>
            <Text size="sm" color="dimmed" mb="md">
              {category === 'Technical Skills' &&
                'Questions about specific skills and technical knowledge'}
              {category === 'Behavioral' && 'Questions about your past experiences and behavior'}
              {category === 'Role-Specific' && 'Questions specific to this particular role'}
              {category === 'Company Knowledge' && 'Questions about the company and industry'}
              {category === 'Problem-Solving' && 'Questions that test your analytical thinking'}
              {![
                'Technical Skills',
                'Behavioral',
                'Role-Specific',
                'Company Knowledge',
                'Problem-Solving',
              ].includes(category) && 'Questions to evaluate your qualifications'}
            </Text>

            <Divider mb="md" />

            <Stack spacing="xs">
              {questions.slice(0, 3).map((q, i) => (
                <Group key={i} position="apart" noWrap>
                  <Text size="sm" lineClamp={1}>
                    {q.question}
                  </Text>
                  <Badge
                    size="xs"
                    color={
                      q.difficulty === 'Easy'
                        ? 'green'
                        : q.difficulty === 'Medium'
                          ? 'yellow'
                          : 'red'
                    }
                  >
                    {q.difficulty}
                  </Badge>
                </Group>
              ))}

              {questions.length > 3 && (
                <Text size="xs" color="dimmed" align="center">
                  + {questions.length - 3} more
                </Text>
              )}
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    );
  };

  // Render interview preparation content
  const renderInterviewContent = () => {
    if (loading) {
      return (
        <Center py="xl">
          <Stack align="center">
            <Loader size="lg" />
            <Text>Generating interview questions...</Text>
          </Stack>
        </Center>
      );
    }

    if (error) {
      return (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="lg">
          {error}
          <Button
            variant="outline"
            color="red"
            size="xs"
            mt="sm"
            onClick={() => form.onSubmit(handleSubmit)()}
          >
            Try Again
          </Button>
        </Alert>
      );
    }

    if (!interviewData) {
      return (
        <Alert icon={<IconBulb size={16} />} title="Tip" color="blue">
          Enter the job details above to generate interview questions and preparation materials.
        </Alert>
      );
    }

    return (
      <Stack spacing="xl">
        <Paper withBorder p="lg" radius="md">
          <Group position="apart">
            <div>
              <Title order={3}>{interviewData.job_title}</Title>
              <Text size="lg" color="dimmed">
                {interviewData.company_name}
              </Text>
            </div>

            <Button
              leftIcon={<IconMessageCircle size={16} />}
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan' }}
              onClick={handleStartMockInterview}
            >
              Start Mock Interview
            </Button>
          </Group>
        </Paper>

        <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]} spacing="lg">
          <Paper withBorder p="lg" radius="md">
            <Group mb="md">
              <ThemeIcon radius="md" size="lg" color="blue">
                <IconBulb size={20} />
              </ThemeIcon>
              <Title order={4}>Preparation Tips</Title>
            </Group>

            <Stack spacing="xs">
              {interviewData.preparation_tips?.map((tip, index) => (
                <Group key={index} spacing="xs" align="flex-start">
                  <ThemeIcon radius="xl" size="sm" color="blue">
                    <IconCheck size={12} />
                  </ThemeIcon>
                  <Text size="sm">{tip}</Text>
                </Group>
              ))}
            </Stack>
          </Paper>

          <Paper withBorder p="lg" radius="md">
            <Group mb="md">
              <ThemeIcon radius="md" size="lg" color="indigo">
                <IconUsers size={20} />
              </ThemeIcon>
              <Title order={4}>Company Research</Title>
            </Group>

            <Stack spacing="xs">
              {interviewData.company_research?.map((point, index) => (
                <Group key={index} spacing="xs" align="flex-start">
                  <ThemeIcon radius="xl" size="sm" color="indigo">
                    <IconCheck size={12} />
                  </ThemeIcon>
                  <Text size="sm">{point}</Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        </SimpleGrid>

        <Title order={3} mt="xl">
          Questions by Category
        </Title>
        {renderCategorySummary()}

        <Paper withBorder p="lg" radius="md">
          <Title order={4} mb="lg">
            All Interview Questions
          </Title>

          <Accordion>
            {interviewData.questions?.map((question, index) => (
              <Accordion.Item key={index} value={`question-${index}`}>
                <Accordion.Control>
                  <Group position="apart">
                    <Text weight={500}>{question.question}</Text>
                    <Group spacing="xs">
                      <Badge
                        color={
                          question.difficulty === 'Easy'
                            ? 'green'
                            : question.difficulty === 'Medium'
                              ? 'yellow'
                              : 'red'
                        }
                      >
                        {question.difficulty}
                      </Badge>
                      <Badge color="blue">{question.category}</Badge>
                    </Group>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack spacing="md">
                    <Box>
                      <Text weight={500} size="sm">
                        Key Points to Include:
                      </Text>
                      <ul>
                        {question.key_points?.map((point, i) => (
                          <li key={i}>
                            <Text size="sm">{point}</Text>
                          </li>
                        ))}
                      </ul>
                    </Box>

                    <Box>
                      <Text weight={500} size="sm">
                        Why This Question Matters:
                      </Text>
                      <Text size="sm">{question.importance}</Text>
                    </Box>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Paper>
      </Stack>
    );
  };

  return (
    <Container size="lg" py="xl">
      <PageHeader
        title="Interview Preparation"
        description="Prepare for your job interviews by practicing with AI-generated questions tailored to your target role."
        icon={<IconMessageCircle size={28} />}
      />

      <Paper withBorder p="lg" radius="md" mb="xl">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
              <TextInput
                required
                label="Job Title"
                placeholder="Software Engineer, Product Manager, etc."
                icon={<IconBriefcase size={16} />}
                {...form.getInputProps('job_title')}
              />

              <TextInput
                required
                label="Company Name"
                placeholder="Company you're interviewing with"
                icon={<IconBuilding size={16} />}
                {...form.getInputProps('company_name')}
              />
            </SimpleGrid>

            <Textarea
              label="Job Description"
              placeholder="Paste the job description here (optional)"
              description="Including a job description will generate more targeted questions"
              minRows={4}
              maxRows={8}
              icon={<IconSearch size={16} />}
              {...form.getInputProps('job_description')}
            />

            <Group position="right">
              <Button type="submit" leftIcon={<IconChevronRight size={16} />} loading={loading}>
                Generate Interview Questions
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>

      {renderInterviewContent()}

      {/* Mock Interview Component */}
      {showMockInterview && interviewData && (
        <MockInterviewFlow
          questions={interviewData.questions}
          jobDetails={{
            job_title: interviewData.job_title,
            company_name: interviewData.company_name,
          }}
          onClose={handleCloseMockInterview}
          onComplete={handleInterviewComplete}
        />
      )}

      {/* Feedback Component */}
      {showFeedback && evaluationResults && (
        <InterviewFeedback
          results={evaluationResults}
          onClose={handleCloseFeedback}
          onRetry={handleStartMockInterview}
        />
      )}
    </Container>
  );
};

export default InterviewPrep;
