import React, { useState, useEffect } from 'react';
import {
  Card,
  Group,
  Text,
  Badge,
  Textarea,
  Button,
  List,
  ThemeIcon,
  Box,
  Progress,
  Collapse,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconChevronDown,
  IconChevronUp,
  IconCheck,
  IconInfoCircle,
  IconClock,
  IconAlertTriangle,
} from '@tabler/icons-react';

/**
 * Component to display an interview question with answer input
 * Can be used in two modes:
 * 1. Review mode: Shows the question with key points and importance
 * 2. Interview mode: Allows the user to answer the question with a timer
 */
const QuestionCard = ({
  question,
  interviewMode = false,
  onAnswerSubmit = null,
  timeLimit = 0,
  showTimer = false,
}) => {
  const [answer, setAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isLowTime, setIsLowTime] = useState(false);
  const [showKeyPoints, { toggle: toggleKeyPoints }] = useDisclosure(false);
  const [showImportance, { toggle: toggleImportance }] = useDisclosure(false);

  // Set up timer if in interview mode with a time limit
  useEffect(() => {
    let timer = null;

    // Clear any existing timers first
    if (interviewMode && showTimer && timeLimit > 0) {
      // Reset time remaining when component mounts or question changes
      setTimeRemaining(timeLimit);
      setIsLowTime(false);

      // Only start the timer if not paused
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          // When time gets low, set isLowTime flag
          if (prev <= 11) {
            setIsLowTime(true);
          }

          // If time is up, submit and clear timer
          if (prev <= 1) {
            if (onAnswerSubmit) {
              onAnswerSubmit(answer, question);
            }
            return 0;
          }

          // Otherwise decrement the timer
          return prev - 1;
        });
      }, 1000);
    }

    // Clean up function to clear the timer
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [interviewMode, showTimer, timeLimit, question, onAnswerSubmit, answer]);

  // Format time remaining in mm:ss format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate timer color based on time remaining
  const getTimerColor = () => {
    const percentRemaining = (timeRemaining / timeLimit) * 100;
    if (percentRemaining <= 20) return 'red';
    if (percentRemaining <= 50) return 'yellow';
    return 'green';
  };

  // Handle answer submission
  const handleSubmit = () => {
    if (onAnswerSubmit) {
      onAnswerSubmit(answer, question);
    }
  };

  const renderTimer = () => {
    if (!showTimer || !interviewMode) return null;

    return (
      <Box sx={{ width: '100%', marginBottom: 15 }}>
        <Group position="apart" mb={5}>
          <Text size="sm" weight={500}>
            <IconClock
              size={16}
              style={{ verticalAlign: 'middle', marginRight: 5 }}
              color={isLowTime ? 'red' : undefined}
            />
            Time Remaining: {formatTime(timeRemaining)}
          </Text>

          {isLowTime && (
            <Badge color="red" variant="filled">
              Time is running out!
            </Badge>
          )}
        </Group>

        <Progress value={(timeRemaining / timeLimit) * 100} color={getTimerColor()} animate />
      </Box>
    );
  };

  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <Group position="apart">
          <Group>
            <Badge
              color={
                question.difficulty === 'Easy'
                  ? 'green'
                  : question.difficulty === 'Medium'
                    ? 'yellow'
                    : 'red'
              }
              size="sm"
            >
              {question.difficulty}
            </Badge>
            <Badge color="blue" size="sm">
              {question.category}
            </Badge>
          </Group>

          {!interviewMode && (
            <Group spacing={5}>
              <Tooltip label="Show key points" position="left">
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={toggleKeyPoints}
                  aria-label="Show key points"
                >
                  {showKeyPoints ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Show importance" position="left">
                <ActionIcon
                  variant="subtle"
                  color="grape"
                  onClick={toggleImportance}
                  aria-label="Show importance"
                >
                  <IconInfoCircle size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          )}
        </Group>
      </Card.Section>

      <Text size="lg" weight={500} mt="md">
        {question.question}
      </Text>

      {/* Timer for interview mode */}
      {renderTimer()}

      {/* Answer textarea for interview mode */}
      {interviewMode && (
        <>
          <Textarea
            placeholder="Type your answer here..."
            label="Your Answer"
            required
            value={answer}
            onChange={(e) => setAnswer(e.currentTarget.value)}
            minRows={5}
            autosize
            maxRows={10}
            mt="md"
          />

          {timeRemaining <= 30 && timeRemaining > 0 && (
            <Text color="red" size="sm" mt={5}>
              <IconAlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
              Only {timeRemaining} seconds remaining!
            </Text>
          )}

          <Group position="right" mt="md">
            <Button variant="filled" onClick={handleSubmit} disabled={answer.trim().length === 0}>
              Submit Answer
            </Button>
          </Group>
        </>
      )}

      {/* Key points section (collapsed by default in review mode) */}
      <Collapse in={showKeyPoints}>
        <Box mt="md">
          <Text weight={500} size="sm" color="dimmed">
            Key Points to Include:
          </Text>
          <List
            spacing="xs"
            size="sm"
            mt={5}
            icon={
              <ThemeIcon color="blue" size={20} radius="xl">
                <IconCheck size={12} />
              </ThemeIcon>
            }
          >
            {question.key_points && question.key_points.length > 0
              ? question.key_points.map((point, index) => (
                  <List.Item key={index}>{point}</List.Item>
                ))
              : [
                  <List.Item key="default">Be concise and specific in your answer</List.Item>,
                  <List.Item key="default2">
                    Include relevant examples from your experience
                  </List.Item>,
                ]}
          </List>
        </Box>
      </Collapse>

      {/* Importance section (collapsed by default in review mode) */}
      <Collapse in={showImportance}>
        <Box mt="md">
          <Text weight={500} size="sm" color="dimmed">
            Why This Question Matters:
          </Text>
          <Text size="sm" mt={5} color="dark">
            {question.importance ||
              'This question helps the interviewer assess your qualifications and fit for the role.'}
          </Text>
        </Box>
      </Collapse>
    </Card>
  );
};

export default QuestionCard;
