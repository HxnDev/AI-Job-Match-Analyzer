import React, { useContext } from 'react';
import {
  Paper,
  Text,
  Stack,
  List,
  Group,
  Badge,
  Accordion,
  Button,
  Modal,
  Textarea,
  Alert,
} from '@mantine/core';
import { IconClipboardCheck, IconAlertCircle } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import axios from 'axios';
import { getApiUrl, getApiKey } from '../utils/apiConfig';
import { ApiKeyContext } from '../App';

const ResumeReview = ({ jobLink, jobTitle, jobDescription, companyName, resumeFile }) => {
  const { hasApiKey, refreshApiKeyStatus } = useContext(ApiKeyContext);
  const [review, setReview] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [reviewModalOpened, { open: openReviewModal, close: closeReviewModal }] =
    useDisclosure(false);
  const [customInstructionOpened, { open: openCustomInstruction, close: closeCustomInstruction }] =
    useDisclosure(false);
  const [customInstructions, setCustomInstructions] = React.useState('');
  const [error, setError] = React.useState(null);

  const handleGetReview = async (instructions = '') => {
    if (!resumeFile) {
      setError('Please upload a resume first');
      return;
    }

    // Check if job description is available
    if (!jobDescription || jobDescription.trim() === '') {
      setError('No job description available. Please try with a different job.');
      return;
    }

    // Check if API key is available
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
      formData.append('job_description', jobDescription);

      // Add job title and company if available
      if (jobTitle) {
        formData.append('job_title', jobTitle);
      }
      if (companyName) {
        formData.append('company_name', companyName);
      }

      // Also append job link for reference
      if (jobLink) {
        formData.append('job_link', jobLink);
      }

      // Add custom instructions if provided
      if (instructions && instructions.trim()) {
        formData.append('custom_instructions', instructions);
      }

      const response = await axios.post(getApiUrl('review-resume'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-API-KEY': apiKey,
        },
      });

      if (response.data.success) {
        setReview(response.data.review);
        openReviewModal();
      } else {
        throw new Error(response.data.error || 'Failed to get resume review');
      }
    } catch (error) {
      console.error('Error getting resume review:', error);
      // Get a more detailed error message if available
      let errorMessage = 'Error getting resume review. Please try again.';

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Your API key appears to be invalid. Please refresh and enter a new key.';
          refreshApiKeyStatus(); // This will check if the API key is still valid
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCustomInstruction = () => {
    setCustomInstructions('');
    openCustomInstruction();
  };

  const handleSubmitCustomInstruction = () => {
    closeCustomInstruction();
    handleGetReview(customInstructions);
  };

  const renderReviewContent = () => {
    if (!review) return <Text>Loading review...</Text>;

    return (
      <Paper shadow="sm" radius="md" p="xl" withBorder>
        <Stack spacing="lg">
          {/* Strengths Section */}
          <div>
            <Group spacing="xs" mb="xs">
              <Badge color="green" size="lg">
                Strengths
              </Badge>
            </Group>
            <List spacing="xs">
              {review.strengths.map((strength, index) => (
                <List.Item key={index}>{strength}</List.Item>
              ))}
            </List>
          </div>

          {/* Weaknesses Section */}
          <div>
            <Group spacing="xs" mb="xs">
              <Badge color="red" size="lg">
                Areas for Improvement
              </Badge>
            </Group>
            <List spacing="xs">
              {review.weaknesses.map((weakness, index) => (
                <List.Item key={index}>{weakness}</List.Item>
              ))}
            </List>
          </div>

          {/* Detailed Suggestions */}
          <div>
            <Text weight={500} size="lg" mb="md">
              Improvement Suggestions
            </Text>
            <Accordion variant="contained">
              {review.improvement_suggestions.map((section, index) => (
                <Accordion.Item key={index} value={section.section}>
                  <Accordion.Control>
                    <Text weight={500}>{section.section}</Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <List spacing="xs">
                      {section.suggestions.map((suggestion, idx) => (
                        <List.Item key={idx}>{suggestion}</List.Item>
                      ))}
                    </List>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        </Stack>
      </Paper>
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

      <Button.Group>
        <Button
          variant="gradient"
          gradient={{ from: '#f68084', to: '#a6c0fe' }}
          onClick={() => handleGetReview()}
          loading={loading}
          style={{ flexGrow: 1 }}
          leftIcon={<IconClipboardCheck size={16} />}
        >
          Get Resume Review
        </Button>
        <Button
          variant="filled"
          onClick={handleOpenCustomInstruction}
          disabled={loading}
          style={{
            flexBasis: 'auto',
            borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: '#a6c0fe',
          }}
        >
          +
        </Button>
      </Button.Group>

      {/* Review Results Modal */}
      <Modal
        opened={reviewModalOpened}
        onClose={closeReviewModal}
        title="Resume Review Analysis"
        size="xl"
        scrollAreaComponent={Modal.ScrollArea}
      >
        {renderReviewContent()}
      </Modal>

      {/* Custom Instruction Modal */}
      <Modal
        opened={customInstructionOpened}
        onClose={closeCustomInstruction}
        title="Customize Resume Review"
        size="md"
      >
        <Stack spacing="md">
          <Text size="sm">Add custom instructions for your resume review:</Text>
          <Textarea
            placeholder="For example: 'Focus on technical skills', 'Highlight areas to improve for leadership roles', etc."
            minRows={4}
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.currentTarget.value)}
          />
          <Group position="right">
            <Button variant="outline" onClick={closeCustomInstruction}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCustomInstruction}>Get Resume Review</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default ResumeReview;
