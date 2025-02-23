import { Text, Button, Stack, Badge, Modal, List, Group, Paper, Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import axios from 'axios';
import ResumeReview from './ResumeReview';

const JobResults = ({ results, resumeFile }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [loadingJobs, setLoadingJobs] = useState({});

  if (!results || results.length === 0) return null;

  const handleGenerateCoverLetter = async (jobLink) => {
    setLoadingJobs((prev) => ({ ...prev, [jobLink]: true }));

    try {
      const response = await axios.post('http://localhost:5050/api/cover-letter', {
        job_link: jobLink,
      });

      if (response.data.success) {
        setCoverLetter(response.data.cover_letter);
        open();
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
              {job.matching_skills.length > 0 ? (
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
              {job.missing_skills.length > 0 ? (
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
              <Button
                variant="light"
                onClick={() => handleGenerateCoverLetter(job.job_link)}
                loading={loadingJobs[job.job_link]}
              >
                Generate Cover Letter
              </Button>
              <ResumeReview jobLink={job.job_link} resumeFile={resumeFile} />
            </Group>
          </Stack>
        </Paper>
      ))}

      {/* Cover Letter Modal */}
      <Modal opened={opened} onClose={close} title="Generated Cover Letter" size="lg">
        <Stack>
          <Text style={{ whiteSpace: 'pre-line' }}>{coverLetter}</Text>
          <Group position="right">
            <Button onClick={close}>Close</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default JobResults;
