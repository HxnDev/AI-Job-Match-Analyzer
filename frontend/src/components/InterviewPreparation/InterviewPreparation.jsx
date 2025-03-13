import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  Stack,
  Tabs,
  Title,
  Text,
  Button,
  Group,
  Card,
  Badge,
  Loader,
  Paper,
  ThemeIcon,
  Grid,
  Alert,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconMessageCircle,
  IconBook,
  IconTargetArrow,
  IconAlertCircle,
  IconCheck,
  IconBulb,
  IconBriefcase,
  IconDeviceAnalytics,
} from '@tabler/icons-react';
import axios from 'axios';
import { getApiUrl, getApiKey } from '../../utils/apiConfig';

import QuestionCard from './QuestionCard';
import InterviewFeedback from './InterviewFeedback';
import MockInterviewFlow from './MockInterviewFlow';

/**
 * Main Interview Preparation component that allows users to prepare for
 * interviews based on job descriptions
 */
const InterviewPreparation = ({ jobDetails, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showFeedback, { open: openFeedback, close: closeFeedback }] = useDisclosure(false);
  const [showMockInterview, { open: openMockInterview, close: closeMockInterview }] =
    useDisclosure(false);
  const [evaluationResults, setEvaluationResults] = useState(null);

  // Load interview questions using useCallback to prevent dependency issues
  const loadInterviewQuestions = useCallback(async () => {
    if (!jobDetails) return;

    setLoading(true);
    setError(null);

    try {
      // Get API key from storage
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('No API key available');
      }

      // Prepare request data - ensure it's clean JSON
      const requestData = {
        job_title: jobDetails.job_title || '',
        company_name: jobDetails.company_name || '',
        job_description: jobDetails.job_description || '',
        job_link: jobDetails.job_link || '',
      };

      const response = await axios.post(getApiUrl('interview-preparation'), requestData, {
        headers: {
          'X-API-KEY': apiKey,
        },
      });

      if (response.data.success) {
        setInterviewData(response.data.interview_data);
      } else {
        throw new Error(response.data.error || 'Failed to load interview questions');
      }
    } catch (error) {
      console.error('Error loading interview questions:', error);
      setError(
        error.response?.data?.error || 'An error occurred while loading interview questions'
      );
      notifications.show({
        title: 'Error',
        message: 'Failed to load interview questions. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [jobDetails]);

  // Load interview questions when component mounts
  useEffect(() => {
    if (jobDetails) {
      loadInterviewQuestions();
    }
  }, [loadInterviewQuestions, jobDetails]);

  const handleStartMockInterview = () => {
    if (!interviewData || !interviewData.questions || interviewData.questions.length === 0) {
      notifications.show({
        title: 'No Questions Available',
        message: "We couldn't load interview questions. Please try again.",
        color: 'red',
      });
      return;
    }

    openMockInterview();
    closeFeedback(); // Close feedback if open
  };

  const handleEvaluationComplete = (results) => {
    setEvaluationResults(results);
    closeMockInterview();
    openFeedback();
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

  // Generate category icon based on category name
  const getCategoryIcon = (category) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('technical')) return <IconDeviceAnalytics size={20} />;
    if (categoryLower.includes('behavioral')) return <IconMessageCircle size={20} />;
    if (categoryLower.includes('role')) return <IconBriefcase size={20} />;
    if (categoryLower.includes('company') || categoryLower.includes('industry'))
      return <IconBook size={20} />;
    if (categoryLower.includes('problem')) return <IconBulb size={20} />;
    return <IconTargetArrow size={20} />;
  };

  // Render category sections on the overview tab
  const renderCategorySections = () => {
    const categorizedQuestions = getQuestionsByCategory();

    return Object.entries(categorizedQuestions).map(([category, questions]) => (
      <Card key={category} withBorder shadow="sm" radius="md" mb="md">
        <Group position="apart" mb="md">
          <Group>
            <ThemeIcon radius="md" size="lg" color="blue">
              {getCategoryIcon(category)}
            </ThemeIcon>
            <Title order={4}>{category}</Title>
          </Group>
          <Badge size="lg">{questions.length} Questions</Badge>
        </Group>

        <Text size="sm" color="dimmed" mb="md">
          {category === 'Technical Skills' &&
            'Questions to assess your technical abilities and job-specific skills'}
          {category === 'Behavioral' &&
            'Questions to evaluate your past experiences and behavior in workplace situations'}
          {category === 'Role-Specific' &&
            'Questions focused on your suitability for this particular role'}
          {category === 'Company Knowledge' &&
            'Questions to gauge your understanding of the company and industry'}
          {category === 'Problem-Solving' &&
            'Questions to assess your analytical and creative thinking skills'}
          {![
            'Technical Skills',
            'Behavioral',
            'Role-Specific',
            'Company Knowledge',
            'Problem-Solving',
          ].includes(category) && 'Questions to evaluate your qualifications for this position'}
        </Text>

        {questions.slice(0, 3).map((question, index) => (
          <Group key={index} position="apart" mb="xs">
            <Text weight={500} size="sm">
              {question.question}
            </Text>
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
          </Group>
        ))}

        {questions.length > 3 && (
          <Text size="sm" color="dimmed" align="center" mt="md">
            + {questions.length - 3} more questions
          </Text>
        )}
      </Card>
    ));
  };

  // Render preparation tips section
  const renderPreparationTips = () => {
    if (!interviewData || !interviewData.preparation_tips) return null;

    return (
      <Card withBorder shadow="sm" radius="md" mb="md">
        <Group mb="md">
          <ThemeIcon radius="md" size="lg" color="teal">
            <IconBulb size={20} />
          </ThemeIcon>
          <Title order={4}>Preparation Tips</Title>
        </Group>

        <Stack spacing="xs">
          {interviewData.preparation_tips.map((tip, index) => (
            <Group key={index} spacing="xs" align="flex-start">
              <ThemeIcon radius="xl" size="sm" color="teal">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text size="sm">{tip}</Text>
            </Group>
          ))}
        </Stack>
      </Card>
    );
  };

  // Render company research section
  const renderCompanyResearch = () => {
    if (!interviewData || !interviewData.company_research) return null;

    return (
      <Card withBorder shadow="sm" radius="md" mb="md">
        <Group mb="md">
          <ThemeIcon radius="md" size="lg" color="indigo">
            <IconBriefcase size={20} />
          </ThemeIcon>
          <Title order={4}>Company Research Points</Title>
        </Group>

        <Stack spacing="xs">
          {interviewData.company_research.map((point, index) => (
            <Group key={index} spacing="xs" align="flex-start">
              <ThemeIcon radius="xl" size="sm" color="indigo">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text size="sm">{point}</Text>
            </Group>
          ))}
        </Stack>
      </Card>
    );
  };

  // Render skills to emphasize
  const renderKeySkills = () => {
    if (!interviewData || !interviewData.key_skills_to_emphasize) return null;

    return (
      <Card withBorder shadow="sm" radius="md" mb="md">
        <Group mb="md">
          <ThemeIcon radius="md" size="lg" color="orange">
            <IconTargetArrow size={20} />
          </ThemeIcon>
          <Title order={4}>Key Skills to Emphasize</Title>
        </Group>

        <Group spacing="xs">
          {interviewData.key_skills_to_emphasize.map((skill, index) => (
            <Badge key={index} size="md" color="orange">
              {skill}
            </Badge>
          ))}
        </Group>
      </Card>
    );
  };

  // Render the overview tab
  const renderOverviewTab = () => {
    if (loading) {
      return (
        <Stack align="center" justify="center" spacing="md" py="xl">
          <Loader size="md" />
          <Text>Loading interview questions and preparation materials...</Text>
        </Stack>
      );
    }

    if (error) {
      return (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error}
          <Button variant="outline" color="red" size="xs" mt="md" onClick={loadInterviewQuestions}>
            Try Again
          </Button>
        </Alert>
      );
    }

    if (!interviewData) {
      return (
        <Alert icon={<IconAlertCircle size={16} />} title="No Data" color="yellow">
          No interview questions are available. Please try again.
          <Button
            variant="outline"
            color="yellow"
            size="xs"
            mt="md"
            onClick={loadInterviewQuestions}
          >
            Reload
          </Button>
        </Alert>
      );
    }

    return (
      <Stack spacing="md">
        <Paper shadow="xs" p="md" withBorder>
          <Group position="apart">
            <div>
              <Title order={3}>{interviewData.job_title}</Title>
              <Text size="sm" color="dimmed">
                {interviewData.company_name}
              </Text>
            </div>
            <Button
              onClick={handleStartMockInterview}
              leftIcon={<IconMessageCircle size={16} />}
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan' }}
            >
              Start Mock Interview
            </Button>
          </Group>
        </Paper>

        <Grid>
          <Grid.Col span={8}>{renderCategorySections()}</Grid.Col>
          <Grid.Col span={4}>
            {renderKeySkills()}
            {renderPreparationTips()}
            {renderCompanyResearch()}
          </Grid.Col>
        </Grid>
      </Stack>
    );
  };

  // Render the questions tab
  const renderQuestionsTab = () => {
    if (loading || error || !interviewData) {
      return renderOverviewTab(); // Reuse the same loading/error states
    }

    const categorizedQuestions = getQuestionsByCategory();

    return (
      <Stack spacing="md">
        <Group position="right">
          <Button
            onClick={handleStartMockInterview}
            leftIcon={<IconMessageCircle size={16} />}
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
          >
            Start Mock Interview
          </Button>
        </Group>

        <Tabs defaultValue={Object.keys(categorizedQuestions)[0] || 'general'}>
          <Tabs.List>
            {Object.keys(categorizedQuestions).map((category) => (
              <Tabs.Tab key={category} value={category} icon={getCategoryIcon(category)}>
                {category}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {Object.entries(categorizedQuestions).map(([category, questions]) => (
            <Tabs.Panel key={category} value={category} pt="md">
              <Stack spacing="md">
                {questions.map((question) => (
                  <QuestionCard key={question.id} question={question} reviewMode={true} />
                ))}
              </Stack>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Stack>
    );
  };

  return (
    <>
      <Modal
        opened={true}
        onClose={onClose}
        title="Interview Preparation"
        size="xl"
        scrollAreaComponent={Modal.ScrollArea}
      >
        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview" icon={<IconBook size={14} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="questions" icon={<IconMessageCircle size={14} />}>
              Questions
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            {renderOverviewTab()}
          </Tabs.Panel>

          <Tabs.Panel value="questions" pt="md">
            {renderQuestionsTab()}
          </Tabs.Panel>
        </Tabs>
      </Modal>

      {/* Mock Interview Modal */}
      {showMockInterview && interviewData && interviewData.questions && (
        <MockInterviewFlow
          questions={interviewData.questions}
          jobDetails={{
            job_title: interviewData.job_title || jobDetails.job_title,
            company_name: interviewData.company_name || jobDetails.company_name,
          }}
          onClose={closeMockInterview}
          onComplete={handleEvaluationComplete}
        />
      )}

      {/* Feedback Modal */}
      {showFeedback && evaluationResults && (
        <InterviewFeedback
          results={evaluationResults}
          onClose={closeFeedback}
          onRetry={handleStartMockInterview}
        />
      )}
    </>
  );
};

export default InterviewPreparation;
