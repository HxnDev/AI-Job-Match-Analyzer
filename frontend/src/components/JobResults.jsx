import {
  Text,
  Button,
  Stack,
  Badge,
  Modal,
  List,
  Group,
  Paper,
  Flex,
  Textarea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import axios from 'axios';
import ResumeReview from './ResumeReview';

const JobResults = ({ results, resumeFile }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [coverLetterOpened, { open: openCoverLetter, close: closeCoverLetter }] =
    useDisclosure(false);
  const [customInstructionOpened, { open: openCustomInstruction, close: closeCustomInstruction }] =
    useDisclosure(false);
  const [loadingJobs, setLoadingJobs] = useState({});
  const [customInstruction, setCustomInstruction] = useState('');
  const [currentJobLink, setCurrentJobLink] = useState('');

  if (!results || results.length === 0) return null;

  const handleGenerateCoverLetter = async (jobLink, instruction = '') => {
    setLoadingJobs((prev) => ({ ...prev, [jobLink]: true }));

    try {
      const response = await axios.post('http://localhost:5050/api/cover-letter', {
        job_link: jobLink,
        custom_instruction: instruction,
      });

      if (response.data.success) {
        setCoverLetter(response.data.cover_letter);
        openCoverLetter();
      } else {
        throw new Error(response.data.error || 'Failed to generate cover letter');
      }
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert(error.response?.data?.error || 'Error generating cover letter. Please try again.');
    } finally {
      setLoadingJobs((prev) => ({ ...prev, [jobLink]: false }));
    }
  };

  const handleOpenCustomInstruction = (jobLink) => {
    setCurrentJobLink(jobLink);
    setCustomInstruction('');
    openCustomInstruction();
  };

  const handleSubmitCustomInstruction = () => {
    closeCustomInstruction();
    handleGenerateCoverLetter(currentJobLink, customInstruction);
  };

  const truncateUrl = (url) => {
    try {
      const maxLength = 60;
      if (url.length <= maxLength) return url;
      return url.substring(0, 30) + '...' + url.substring(url.length - 27);
    } catch (error) {
      return url;
    }
  };

  return (
    <Stack spacing="md">
      <Text size="xl" weight={700}>
        Analysis Results
      </Text>

      {results.map((job, index) => (
        <Paper key={index} shadow="xs" p="md" withBorder>
          <Stack spacing="sm">
            {/* Job Header Section */}
            <Stack spacing={4}>
              <Group position="apart" align="center">
                <Text size="lg" weight={600} color="blue">
                  {job.job_title}
                </Text>
                <Badge
                  color={
                    job.match_percentage >= 80
                      ? 'green'
                      : job.match_percentage >= 60
                        ? 'yellow'
                        : 'red'
                  }
                  size="lg"
                >
                  {job.match_percentage}% MATCH
                </Badge>
              </Group>
              <Flex gap="xs" align="center">
                <Text size="md" weight={500}>
                  {job.company_name}
                </Text>
                <Text size="sm" color="dimmed">
                  •
                </Text>
                <Text size="sm" color="dimmed">
                  {job.platform}
                </Text>
              </Flex>
              <Text size="sm" color="dimmed" style={{ wordBreak: 'break-all' }}>
                {truncateUrl(job.job_link)}
              </Text>
            </Stack>

            {/* Matching Skills */}
            <div>
              <Text weight={500} size="sm" mb="xs">
                Matching Skills:
              </Text>
              {job.matching_skills && job.matching_skills.length > 0 ? (
                <Group spacing="xs">
                  {job.matching_skills.map((skill, i) => (
                    <Badge key={i} variant="dot" color="green">
                      {skill}
                    </Badge>
                  ))}
                </Group>
              ) : (
                <Text color="dimmed" size="sm">
                  No matching skills found
                </Text>
              )}
            </div>

            {/* Missing Skills */}
            <div>
              <Text weight={500} size="sm" mb="xs">
                Skills to Develop:
              </Text>
              {job.missing_skills && job.missing_skills.length > 0 ? (
                <Group spacing="xs">
                  {job.missing_skills.map((skill, i) => (
                    <Badge key={i} variant="dot" color="red">
                      {skill}
                    </Badge>
                  ))}
                </Group>
              ) : (
                <Text color="dimmed" size="sm">
                  No missing skills - Great match!
                </Text>
              )}
            </div>

            {/* Recommendations */}
            <div>
              <Text weight={500} size="sm" mb="xs">
                Recommendations:
              </Text>
              {job.recommendations && job.recommendations.length > 0 ? (
                <List size="sm">
                  {job.recommendations.map((rec, i) => (
                    <List.Item key={i}>{rec}</List.Item>
                  ))}
                </List>
              ) : (
                <Text color="dimmed" size="sm">
                  No specific recommendations - Your profile matches well!
                </Text>
              )}
            </div>

            {/* Action Buttons */}
            <Group grow>
              <Button.Group>
                <Button
                  variant="light"
                  color="blue"
                  onClick={() => handleGenerateCoverLetter(job.job_link)}
                  loading={loadingJobs[job.job_link]}
                  style={{ flexGrow: 1 }}
                >
                  Generate Cover Letter
                </Button>
                <Button
                  variant="light"
                  color="teal"
                  onClick={() => handleOpenCustomInstruction(job.job_link)}
                  disabled={loadingJobs[job.job_link]}
                  style={{ flexBasis: 'auto' }}
                >
                  +
                </Button>
              </Button.Group>
              <ResumeReview jobLink={job.job_link} resumeFile={resumeFile} />
            </Group>
          </Stack>
        </Paper>
      ))}

      {/* Cover Letter Modal */}
      <Modal
        opened={coverLetterOpened}
        onClose={closeCoverLetter}
        title="Generated Cover Letter"
        size="lg"
      >
        <Stack>
          <Text style={{ whiteSpace: 'pre-line' }}>{coverLetter}</Text>
          <Group position="right">
            <Button onClick={closeCoverLetter}>Close</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Custom Instruction Modal */}
      <Modal
        opened={customInstructionOpened}
        onClose={closeCustomInstruction}
        title="Customize Cover Letter"
        size="md"
      >
        <Stack spacing="md">
          <Text size="sm">Add custom instructions for your cover letter generation:</Text>
          <Textarea
            placeholder="For example: 'Focus on my leadership skills', 'Highlight remote work experience', 'Target this specific role', etc."
            minRows={4}
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.currentTarget.value)}
          />
          <Group position="right">
            <Button variant="outline" onClick={closeCustomInstruction}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCustomInstruction}>Generate Cover Letter</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default JobResults;
