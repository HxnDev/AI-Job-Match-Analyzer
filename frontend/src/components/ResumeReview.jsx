import React from 'react';
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
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import axios from 'axios';

const ResumeReview = ({ jobLink, resumeFile }) => {
  const [review, setReview] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [manualJobDescription, setManualJobDescription] = React.useState('');
  const [needsManualEntry, setNeedsManualEntry] = React.useState(false);

  const handleGetReview = async () => {
    if (!resumeFile) {
      alert('Please upload a resume first');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('job_link', jobLink);

      const response = await axios.post('http://localhost:5050/api/review-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        if (response.data.requires_manual_entry) {
          setNeedsManualEntry(true);
          open();
        } else {
          setReview(response.data.review);
          open();
        }
      } else {
        throw new Error(response.data.error || 'Failed to get resume review');
      }
    } catch (error) {
      console.error('Error getting resume review:', error);
      alert(error.response?.data?.error || 'Error getting resume review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualJobDescription.trim()) {
      alert('Please enter the job description');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('job_description', manualJobDescription);

      const response = await axios.post(
        'http://localhost:5050/api/review-resume-manual',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setReview(response.data.review);
        setNeedsManualEntry(false);
      } else {
        throw new Error(response.data.error || 'Failed to get resume review');
      }
    } catch (error) {
      console.error('Error getting resume review:', error);
      alert(error.response?.data?.error || 'Error getting resume review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderReviewContent = () => {
    if (needsManualEntry) {
      return (
        <Stack spacing="md">
          <Text>
            We couldn&apos;t automatically fetch the job description. Please paste it here:
          </Text>
          <Textarea
            placeholder="Paste the job description here..."
            minRows={5}
            value={manualJobDescription}
            onChange={(e) => setManualJobDescription(e.currentTarget.value)}
          />
          <Button
            onClick={handleManualSubmit}
            loading={loading}
            disabled={!manualJobDescription.trim()}
          >
            Analyze Resume
          </Button>
        </Stack>
      );
    }

    if (!review) return null;

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
      <Button variant="light" color="violet" onClick={handleGetReview} loading={loading} fullWidth>
        Get Resume Review
      </Button>

      <Modal
        opened={opened}
        onClose={close}
        title={needsManualEntry ? 'Enter Job Description' : 'Resume Review Analysis'}
        size="xl"
        scrollAreaComponent={Modal.ScrollArea}
      >
        {renderReviewContent()}
      </Modal>
    </>
  );
};

export default ResumeReview;
