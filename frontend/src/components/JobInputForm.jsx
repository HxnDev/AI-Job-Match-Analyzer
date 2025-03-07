import React, { useState } from 'react';
import {
  TextInput,
  Button,
  Stack,
  Text,
  Paper,
  ActionIcon,
  Group,
  Textarea,
  Badge,
  Tooltip,
} from '@mantine/core';
import {
  IconTrash,
  IconPlus,
  IconBuilding,
  IconBriefcase,
  IconFileDescription,
  IconLink,
} from '@tabler/icons-react';

const JobInputForm = ({ jobDetails, setJobDetails }) => {
  const [currentJob, setCurrentJob] = useState({
    company_name: '',
    job_title: '',
    job_description: '',
    job_link: '',
  });

  const handleAddJob = () => {
    // Validate that at least company name and job title are present
    if (currentJob.company_name.trim() === '' || currentJob.job_title.trim() === '') {
      return;
    }

    // Add the current job to the list
    setJobDetails([...jobDetails, { ...currentJob }]);

    // Reset the form
    setCurrentJob({
      company_name: '',
      job_title: '',
      job_description: '',
      job_link: '',
    });
  };

  const handleRemoveJob = (index) => {
    setJobDetails(jobDetails.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddJob();
    }
  };

  // Function to create a truncated display version of the job link
  const truncateUrl = (url) => {
    if (!url) return '';

    try {
      const maxLength = 40;
      if (url.length <= maxLength) return url;
      return url.substring(0, 20) + '...' + url.substring(url.length - 17);
    } catch (error) {
      return url;
    }
  };

  return (
    <Stack spacing="md">
      <Text size="sm" weight={500}>
        Job Details
      </Text>

      <Paper shadow="xs" radius="md" p="md" withBorder>
        <Stack spacing="md">
          <Group grow>
            <TextInput
              placeholder="Company Name"
              label="Company Name"
              icon={<IconBuilding size={16} />}
              value={currentJob.company_name}
              onChange={(e) => setCurrentJob({ ...currentJob, company_name: e.target.value })}
              required
            />
            <TextInput
              placeholder="Job Title"
              label="Job Title"
              icon={<IconBriefcase size={16} />}
              value={currentJob.job_title}
              onChange={(e) => setCurrentJob({ ...currentJob, job_title: e.target.value })}
              required
            />
          </Group>

          <TextInput
            placeholder="Job Link (Optional)"
            label="Job Link"
            icon={<IconLink size={16} />}
            value={currentJob.job_link}
            onChange={(e) => setCurrentJob({ ...currentJob, job_link: e.target.value })}
          />

          <Textarea
            placeholder="Paste job description here"
            label="Job Description"
            icon={<IconFileDescription size={16} />}
            minRows={4}
            value={currentJob.job_description}
            onChange={(e) => setCurrentJob({ ...currentJob, job_description: e.target.value })}
            onKeyPress={handleKeyPress}
          />

          <Group position="right">
            <Text size="xs" color="dimmed">
              Press Ctrl+Enter to add
            </Text>
            <Button
              onClick={handleAddJob}
              leftIcon={<IconPlus size={16} />}
              disabled={!currentJob.company_name.trim() || !currentJob.job_title.trim()}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
            >
              Add Job
            </Button>
          </Group>
        </Stack>
      </Paper>

      {jobDetails.length > 0 && (
        <Stack spacing="xs">
          <Text size="sm" weight={500}>
            Added Jobs
          </Text>
          {jobDetails.map((job, index) => (
            <Paper key={index} shadow="xs" p="md" radius="md" withBorder>
              <Group position="apart">
                <div>
                  <Group spacing="xs">
                    <Text weight={500}>{job.job_title}</Text>
                    <Text color="dimmed">at</Text>
                    <Text weight={500}>{job.company_name}</Text>
                  </Group>

                  {job.job_link && (
                    <Tooltip label={job.job_link} position="top">
                      <Text size="sm" color="dimmed" style={{ cursor: 'pointer' }}>
                        {truncateUrl(job.job_link)}
                      </Text>
                    </Tooltip>
                  )}
                </div>
                <Group spacing="xs">
                  <Badge color="blue">
                    {job.job_description
                      ? `${Math.min(job.job_description.length, 2000)} chars`
                      : 'No description'}
                  </Badge>
                  <ActionIcon color="red" onClick={() => handleRemoveJob(index)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default JobInputForm;
