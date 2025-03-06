import React from 'react';
import { Paper, Title, Grid, Text, Stack } from '@mantine/core';
import MotivationalMessage from './MotivationalMessage';
import EmailReplyGenerator from './EmailReplyGenerator';

const ToolsSection = ({ jobTitle }) => {
  return (
    <Paper shadow="sm" radius="md" p="xl" withBorder>
      <Stack spacing="md">
        <Title order={3}>Job Search Tools</Title>
        <Text size="sm" color="dimmed">
          Additional tools to help with your job search and professional communication
        </Text>

        <Grid gutter="md">
          <Grid.Col xs={12} sm={6}>
            <MotivationalMessage jobTitle={jobTitle} />
          </Grid.Col>
          <Grid.Col xs={12} sm={6}>
            <EmailReplyGenerator />
          </Grid.Col>
        </Grid>
      </Stack>
    </Paper>
  );
};

export default ToolsSection;
