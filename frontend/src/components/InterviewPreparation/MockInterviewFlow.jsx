import React, { useState, useEffect } from 'react';
import {
  Modal,
  Stepper,
  Group,
  Button,
  Text,
  Stack,
  Title,
  Paper,
  Box,
  Progress,
  LoadingOverlay,
  Center,
  useMantineTheme,
  Alert,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconInfoCircle,
  IconPlayerPause,
  IconPlayerPlay,
  IconClock,
  IconAlertCircle,
} from '@tabler/icons-react';
import axios from 'axios';
import { getApiUrl, getApiKey } from '../../utils/apiConfig';

import QuestionCard from './QuestionCard';

/**
 * Component to guide the user through a mock interview process
 * with a step-by-step flow for answering questions and receiving feedback
 */
const MockInterviewFlow = ({ questions = [], jobDetails, onClose, onComplete }) => {
  const theme = useMantineTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [error, setError] = useState(null);

  // Set up questions for the interview
  useEffect(() => {
    if (questions && questions.length > 0) {
      // Select questions from each category
      const categorizedQuestions = {};

      // Group questions by category
      questions.forEach((question) => {
        const category = question.category || 'General';
        if (!categorizedQuestions[category]) {
          categorizedQuestions[category] = [];
        }
        categorizedQuestions[category].push(question);
      });

      // Select up to 2 questions from each category
      let selected = [];
      Object.values(categorizedQuestions).forEach((categoryQuestions) => {
        // Shuffle and take up to 2
        const shuffled = [...categoryQuestions].sort(() => 0.5 - Math.random());
        selected = [...selected, ...shuffled.slice(0, 2)];
      });

      // Limit to 10 questions total
      selected = selected.slice(0, 10);

      // Randomize the final order
      selected = selected.sort(() => 0.5 - Math.random());

      setSelectedQuestions(selected);

      // Calculate total interview time (2 minutes per question)
      const timePerQuestion = 120; // 2 minutes in seconds
      setTotalTime(selected.length * timePerQuestion);
    }
  }, [questions]);

  // Timer effect for the overall interview
  useEffect(() => {
    let timer;

    if (interviewStarted && !isPaused && activeStep === 1) {
      timer = setInterval(() => {
        setElapsedTime((prevTime) => {
          const newTime = prevTime + 1;
          // Don't exceed total time
          return newTime > totalTime ? totalTime : newTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [interviewStarted, isPaused, activeStep, totalTime]);

  // Handle answer submission for each question
  const handleAnswerSubmit = (answer, question) => {
    // Check if answer is empty and provide default text if needed
    const finalAnswer = answer.trim() ? answer : 'No answer provided within the time limit.';

    // Store the answer
    setAnswers((prev) => ({
      ...prev,
      [question.id]: finalAnswer,
    }));

    // Move to next question or finish
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      // Important: Reset any timer-related state here
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      // If this was the last question, submit all answers for evaluation
      handleSubmitInterview();
    }
  };

  // Submit all answers for evaluation
  const handleSubmitInterview = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Get API key from storage
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('No API key available');
      }

      // Format the questions and answers for submission
      const questionAnswers = selectedQuestions.map((question) => ({
        question,
        answer: answers[question.id] || 'No answer provided within the time limit.', // Default for unanswered questions
      }));

      const response = await axios.post(
        getApiUrl('evaluate-answers'),
        {
          question_answers: questionAnswers,
        },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );

      if (response.data.success) {
        // Add interview metadata to the results
        const resultsWithMeta = {
          ...response.data,
          job_title: jobDetails.job_title,
          company_name: jobDetails.company_name,
          interview_duration: elapsedTime,
          total_questions: selectedQuestions.length,
          answered_questions: Object.keys(answers).length,
        };

        // Call the onComplete callback with the results
        if (onComplete) {
          onComplete(resultsWithMeta);
        }
      } else {
        throw new Error(response.data.error || 'Failed to evaluate answers');
      }
    } catch (error) {
      console.error('Error evaluating interview answers:', error);
      setError(error.response?.data?.error || 'Error evaluating answers. Please try again.');
      notifications.show({
        title: 'Error',
        message: 'There was a problem evaluating your interview. Please try again.',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start the interview
  const startInterview = () => {
    setInterviewStarted(true);
    setActiveStep(1);
  };

  // Toggle pause/resume for the interview
  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // Render the setup step
  const renderSetupStep = () => (
    <Stack spacing="md">
      <Title order={3} align="center">
        Mock Interview Setup
      </Title>

      <Paper withBorder p="md" radius="md">
        <Stack spacing="xs">
          <Text weight={500}>You&apos;re about to start a mock interview for:</Text>
          <Text>
            {jobDetails.job_title} at {jobDetails.company_name}
          </Text>

          <Text weight={500} mt="sm">
            This interview will include:
          </Text>
          <Text>• {selectedQuestions.length} questions selected from different categories</Text>
          <Text>• Approximately {Math.ceil(totalTime / 60)} minutes total duration</Text>
          <Text>• 2 minutes per question (recommended)</Text>
          <Text>• AI-powered feedback on your answers</Text>
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md" bg="blue.0">
        <Group spacing="sm">
          <IconInfoCircle color={theme.colors.blue[6]} />
          <Text>
            Tips: Answer like you would in a real interview. Be concise but thorough. Use specific
            examples from your experience when possible.
          </Text>
        </Group>
      </Paper>

      <Group position="center" mt="xl">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={startInterview}>Start Mock Interview</Button>
      </Group>
    </Stack>
  );

  // Render the interview questions step
  const renderInterviewStep = () => {
    const currentQuestion = selectedQuestions[currentQuestionIndex];

    if (!currentQuestion) {
      return (
        <Center style={{ height: 300 }}>
          <Stack align="center">
            <Text>No questions available</Text>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </Stack>
        </Center>
      );
    }

    return (
      <Stack spacing="md">
        <Group position="apart">
          <Text weight={500}>
            Question {currentQuestionIndex + 1} of {selectedQuestions.length}
          </Text>

          <Group>
            <Button
              variant="subtle"
              size="sm"
              leftIcon={isPaused ? <IconPlayerPlay size={16} /> : <IconPlayerPause size={16} />}
              onClick={togglePause}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>

            <Text size="sm">
              <IconClock size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
              {formatTime(elapsedTime)} / {formatTime(totalTime)}
            </Text>
          </Group>
        </Group>

        <Progress value={(elapsedTime / totalTime) * 100} color="blue" size="sm" mb="md" />

        <Box style={{ position: 'relative' }}>
          <LoadingOverlay visible={isPaused} overlayBlur={2} />

          <QuestionCard
            question={currentQuestion}
            interviewMode={true}
            onAnswerSubmit={handleAnswerSubmit}
            timeLimit={120} // 2 minutes per question
            showTimer={!isPaused}
          />
        </Box>

        <Text size="sm" color="dimmed" align="center">
          Your answers will be automatically submitted when the timer ends or when you click
          &quot;Submit Answer&quot;
        </Text>
      </Stack>
    );
  };

  return (
    <Modal
      opened={true}
      onClose={submitting ? () => {} : onClose}
      title="Mock Interview"
      size="xl"
      closeOnClickOutside={false}
      closeOnEscape={!submitting}
      trapFocus
    >
      <LoadingOverlay visible={submitting} overlayBlur={2} />

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
          {error}
        </Alert>
      )}

      <Stepper active={activeStep} breakpoint="sm" mb="xl">
        <Stepper.Step
          label="Setup"
          description="Prepare for the interview"
          icon={<IconInfoCircle size={18} />}
          completedIcon={<IconCheck size={18} />}
        >
          {renderSetupStep()}
        </Stepper.Step>

        <Stepper.Step
          label="Interview"
          description="Answer the questions"
          icon={<IconClock size={18} />}
          completedIcon={<IconCheck size={18} />}
        >
          {renderInterviewStep()}
        </Stepper.Step>

        <Stepper.Step
          label="Evaluation"
          description="Receive feedback"
          icon={<IconCheck size={18} />}
          loading={submitting}
        />
      </Stepper>
    </Modal>
  );
};

export default MockInterviewFlow;
