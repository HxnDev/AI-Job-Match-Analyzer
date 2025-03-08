import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Title,
  Paper,
  Accordion,
  Button,
  ThemeIcon,
  RingProgress,
  Badge,
  List,
  Box,
  Card,
  Divider,
  Tabs,
  ScrollArea,
  useMantineTheme,
  Progress,
} from '@mantine/core';
import {
  IconCheck,
  IconX,
  IconChartBar,
  IconBulb,
  IconStarFilled,
  IconArrowRight,
  IconListCheck,
  IconMessageDots,
} from '@tabler/icons-react';

/**
 * Component to display interview feedback and evaluation results
 */
const InterviewFeedback = ({ results, onClose, onRetry }) => {
  const theme = useMantineTheme();
  const [activeTab, setActiveTab] = useState('overview');

  if (!results) {
    return null;
  }

  // Helper function to get color based on score
  const getScoreColor = (score) => {
    if (score >= 8) return 'green';
    if (score >= 6) return 'yellow';
    return 'red';
  };

  // Helper function to get color based on readiness level
  const getReadinessColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'red';
      default:
        return 'blue';
    }
  };

  // Organize evaluations by category
  const getEvaluationsByCategory = () => {
    const categories = {};

    // Changed 'eval' to 'evaluation' to avoid using reserved keyword
    results.evaluations?.forEach((evaluation) => {
      const category = evaluation.category || 'General';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(evaluation);
    });

    return categories;
  };

  // Calculate category averages
  const calculateCategoryScores = () => {
    const categories = getEvaluationsByCategory();
    const scores = {};

    // Changed 'evals' to 'evaluationList' and 'eval' to 'evaluation'
    Object.entries(categories).forEach(([category, evaluationList]) => {
      const total = evaluationList.reduce(
        (sum, evaluation) => sum + (evaluation.evaluation?.score || 0),
        0
      );
      scores[category] = total / evaluationList.length;
    });

    return scores;
  };

  // Get strongest and weakest categories
  const getCategoryStrengths = () => {
    const scores = calculateCategoryScores();
    const sortedCategories = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    return {
      strongest: sortedCategories.slice(0, 2).map(([category]) => category),
      weakest: sortedCategories.slice(-2).map(([category]) => category),
    };
  };

  // Render the overview tab
  const renderOverviewTab = () => {
    const { strongest, weakest } = getCategoryStrengths();

    return (
      <Stack spacing="xl">
        {/* Score and Readiness */}
        <Paper withBorder p="lg" radius="md">
          <Group position="apart" align="flex-start">
            <div>
              <Title order={3}>Interview Performance</Title>
              <Text color="dimmed">
                {results.job_title} at {results.company_name}
              </Text>

              <Stack spacing="xs" mt="lg">
                <Text weight={500}>Overall Feedback:</Text>
                <Text>{results.overall_feedback}</Text>
              </Stack>
            </div>

            <Stack align="center" spacing={5}>
              <RingProgress
                size={120}
                thickness={12}
                sections={[
                  {
                    value: results.overall_score * 10,
                    color: getScoreColor(results.overall_score),
                  },
                ]}
                label={
                  <Text size="lg" weight={700} align="center">
                    {results.overall_score}/10
                  </Text>
                }
              />
              <Badge size="lg" color={getReadinessColor(results.readiness_level)}>
                {results.readiness_level} Readiness
              </Badge>

              <Text size="sm" color="dimmed" mt={5}>
                {results.answered_questions || 0} questions answered
              </Text>
            </Stack>
          </Group>
        </Paper>

        {/* Strengths and Areas for Improvement */}
        <Group grow align="stretch">
          <Card withBorder padding="lg" radius="md" style={{ flex: 1 }}>
            <Group mb="md">
              <ThemeIcon color="green" size="lg" radius="md">
                <IconCheck size={20} />
              </ThemeIcon>
              <Title order={4}>Strengths</Title>
            </Group>

            <List spacing="sm">
              {results.strengths?.map((strength, index) => (
                <List.Item key={index}>{strength}</List.Item>
              ))}
            </List>

            {strongest.length > 0 && (
              <>
                <Text weight={500} size="sm" mt="lg">
                  Strongest Categories:
                </Text>
                <Group mt="xs">
                  {strongest.map((category, index) => (
                    <Badge key={index} color="green" variant="light">
                      {category}
                    </Badge>
                  ))}
                </Group>
              </>
            )}
          </Card>

          <Card withBorder padding="lg" radius="md" style={{ flex: 1 }}>
            <Group mb="md">
              <ThemeIcon color="red" size="lg" radius="md">
                <IconX size={20} />
              </ThemeIcon>
              <Title order={4}>Areas for Improvement</Title>
            </Group>

            <List spacing="sm">
              {results.areas_for_improvement?.map((area, index) => (
                <List.Item key={index}>{area}</List.Item>
              ))}
            </List>

            {weakest.length > 0 && (
              <>
                <Text weight={500} size="sm" mt="lg">
                  Categories to Focus On:
                </Text>
                <Group mt="xs">
                  {weakest.map((category, index) => (
                    <Badge key={index} color="red" variant="light">
                      {category}
                    </Badge>
                  ))}
                </Group>
              </>
            )}
          </Card>
        </Group>

        {/* Next Steps */}
        <Paper withBorder p="lg" radius="md">
          <Group mb="md">
            <ThemeIcon color="blue" size="lg" radius="md">
              <IconArrowRight size={20} />
            </ThemeIcon>
            <Title order={4}>Next Steps</Title>
          </Group>

          <List
            spacing="sm"
            icon={
              <ThemeIcon color="blue" size={24} radius="xl">
                <IconCheck size={16} />
              </ThemeIcon>
            }
          >
            {results.next_steps?.map((step, index) => (
              <List.Item key={index}>{step}</List.Item>
            ))}
          </List>
        </Paper>
      </Stack>
    );
  };

  // Render the detailed feedback tab
  const renderDetailedTab = () => {
    const categorizedEvaluations = getEvaluationsByCategory();

    return (
      <Tabs defaultValue={Object.keys(categorizedEvaluations)[0] || 'general'}>
        <Tabs.List>
          {Object.keys(categorizedEvaluations).map((category) => (
            <Tabs.Tab key={category} value={category} icon={<IconMessageDots size={14} />}>
              {category}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {Object.entries(categorizedEvaluations).map(([category, evaluations]) => (
          <Tabs.Panel key={category} value={category} pt="md">
            <Stack spacing="md">
              {evaluations.map((evaluation, index) => (
                <Paper key={index} withBorder radius="md" p="md">
                  <Stack spacing="md">
                    <Group position="apart">
                      <Text weight={500}>{evaluation.question_text}</Text>
                      <Badge size="lg" color={getScoreColor(evaluation.evaluation?.score || 0)}>
                        {evaluation.evaluation?.score || 0}/10
                      </Badge>
                    </Group>

                    <Box bg={theme.colors.gray[0]} p="sm" style={{ borderRadius: theme.radius.sm }}>
                      <Text size="sm" color="dimmed" mb={5}>
                        Your Answer:
                      </Text>
                      <Text size="sm">{evaluation.answer}</Text>
                    </Box>

                    <Divider />

                    <Text size="sm">{evaluation.evaluation?.feedback}</Text>

                    <Accordion variant="separated">
                      <Accordion.Item value="strengths">
                        <Accordion.Control icon={<IconCheck color={theme.colors.green[6]} />}>
                          Strengths
                        </Accordion.Control>
                        <Accordion.Panel>
                          <List size="sm" spacing="xs">
                            {evaluation.evaluation?.strengths?.map((strength, i) => (
                              <List.Item key={i}>{strength}</List.Item>
                            ))}
                          </List>
                        </Accordion.Panel>
                      </Accordion.Item>

                      <Accordion.Item value="improvements">
                        <Accordion.Control icon={<IconX color={theme.colors.red[6]} />}>
                          Areas for Improvement
                        </Accordion.Control>
                        <Accordion.Panel>
                          <List size="sm" spacing="xs">
                            {evaluation.evaluation?.areas_for_improvement?.map((area, i) => (
                              <List.Item key={i}>{area}</List.Item>
                            ))}
                          </List>
                        </Accordion.Panel>
                      </Accordion.Item>

                      <Accordion.Item value="sample">
                        <Accordion.Control icon={<IconBulb color={theme.colors.yellow[6]} />}>
                          Sample Strong Answer
                        </Accordion.Control>
                        <Accordion.Panel>
                          <Text size="sm" italic mb="xs" color="dimmed">
                            Example of a strong response:
                          </Text>
                          <Text size="sm">{evaluation.evaluation?.sample_answer}</Text>
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Tabs.Panel>
        ))}
      </Tabs>
    );
  };

  // Render the statistics tab
  const renderStatsTab = () => {
    const categoryScores = calculateCategoryScores();

    return (
      <Stack spacing="xl">
        <Title order={3}>Performance Breakdown</Title>

        {/* Category Scores */}
        <Paper withBorder p="lg" radius="md">
          <Title order={4} mb="md">
            Category Performance
          </Title>

          <Stack spacing="md">
            {Object.entries(categoryScores).map(([category, score]) => (
              <div key={category}>
                <Group position="apart" mb={5}>
                  <Text>{category}</Text>
                  <Text weight={500} color={getScoreColor(score)}>
                    {score.toFixed(1)}/10
                  </Text>
                </Group>
                <Progress value={score * 10} color={getScoreColor(score)} size="lg" radius="sm" />
              </div>
            ))}
          </Stack>
        </Paper>

        {/* Question Difficulty Breakdown */}
        <Paper withBorder p="lg" radius="md">
          <Title order={4} mb="md">
            Question Difficulty Performance
          </Title>

          <Group grow align="flex-start">
            {['Easy', 'Medium', 'Hard'].map((difficulty) => {
              // Filter evaluations by difficulty - changed 'eval' to 'item'
              const difficultyEvals =
                results.evaluations?.filter((item) => item.difficulty === difficulty) || [];

              // Calculate average score for this difficulty - changed 'eval' to 'item'
              const avgScore =
                difficultyEvals.length > 0
                  ? difficultyEvals.reduce((sum, item) => sum + (item.evaluation?.score || 0), 0) /
                    difficultyEvals.length
                  : 0;

              return (
                <Card key={difficulty} withBorder shadow="sm" radius="md" p="md">
                  <Stack align="center" spacing={5}>
                    <Badge
                      size="lg"
                      color={
                        difficulty === 'Easy' ? 'green' : difficulty === 'Medium' ? 'yellow' : 'red'
                      }
                    >
                      {difficulty}
                    </Badge>

                    <RingProgress
                      size={80}
                      thickness={8}
                      sections={[{ value: avgScore * 10, color: getScoreColor(avgScore) }]}
                      label={
                        <Text size="xs" weight={700} align="center">
                          {avgScore.toFixed(1)}
                        </Text>
                      }
                    />

                    <Text size="sm" color="dimmed">
                      {difficultyEvals.length} questions
                    </Text>
                  </Stack>
                </Card>
              );
            })}
          </Group>
        </Paper>
      </Stack>
    );
  };

  return (
    <Modal
      opened={true}
      onClose={onClose}
      title={<Title order={3}>Interview Feedback</Title>}
      size="xl"
      scrollAreaComponent={Modal.ScrollArea}
    >
      <Tabs value={activeTab} onTabChange={setActiveTab} mb="md">
        <Tabs.List>
          <Tabs.Tab value="overview" icon={<IconStarFilled size={14} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="detailed" icon={<IconListCheck size={14} />}>
            Question Feedback
          </Tabs.Tab>
          <Tabs.Tab value="stats" icon={<IconChartBar size={14} />}>
            Statistics
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <ScrollArea.Autosize maxHeight={600}>{renderOverviewTab()}</ScrollArea.Autosize>
        </Tabs.Panel>

        <Tabs.Panel value="detailed" pt="md">
          <ScrollArea.Autosize maxHeight={600}>{renderDetailedTab()}</ScrollArea.Autosize>
        </Tabs.Panel>

        <Tabs.Panel value="stats" pt="md">
          <ScrollArea.Autosize maxHeight={600}>{renderStatsTab()}</ScrollArea.Autosize>
        </Tabs.Panel>
      </Tabs>

      <Group position="right" mt="xl">
        <Button variant="outline" onClick={onRetry}>
          Try Another Interview
        </Button>
        <Button onClick={onClose}>Close</Button>
      </Group>
    </Modal>
  );
};

export default InterviewFeedback;
