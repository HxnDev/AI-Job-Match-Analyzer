import { TextInput, Button, Stack, Text, List, ActionIcon, Group, Paper } from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';

const JobInput = ({ jobLinks, setJobLinks }) => {
  const [jobUrl, setJobUrl] = useState('');

  const handleAddJob = () => {
    if (jobUrl.trim() !== '') {
      setJobLinks([...jobLinks, jobUrl.trim()]);
      setJobUrl('');
    }
  };

  const handleRemoveJob = (index) => {
    setJobLinks(jobLinks.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddJob();
    }
  };

  // Function to truncate URL for display
  const truncateUrl = (url) => {
    try {
      // Create maximum character limit
      const maxLength = 60;

      if (url.length <= maxLength) return url;

      // Take first 30 chars and last 27 chars (leaving space for "...")
      return url.substring(0, 30) + '...' + url.substring(url.length - 27);
    } catch (error) {
      return url;
    }
  };

  return (
    <Stack spacing="xs">
      <Text size="sm" weight={500}>
        Job Postings
      </Text>

      <Group spacing="xs" grow>
        <TextInput
          placeholder="Enter job posting URL"
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button
          onClick={handleAddJob}
          disabled={!jobUrl.trim()}
          leftIcon={<IconPlus size={16} />}
          style={{ flexGrow: 0 }}
        >
          Add
        </Button>
      </Group>

      {jobLinks.length > 0 && (
        <Paper withBorder p="xs" radius="sm">
          <List spacing="xs" size="sm">
            {jobLinks.map((link, index) => (
              <List.Item
                key={index}
                icon={
                  <ActionIcon color="red" variant="subtle" onClick={() => handleRemoveJob(index)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                }
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <Text
                  size="sm"
                  style={{
                    wordBreak: 'break-all',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {truncateUrl(link)}
                </Text>
              </List.Item>
            ))}
          </List>
        </Paper>
      )}
    </Stack>
  );
};

export default JobInput;
