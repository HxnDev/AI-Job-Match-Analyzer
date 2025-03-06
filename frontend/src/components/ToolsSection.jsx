import React from 'react';
import { Paper, Title, Grid, Text, Stack } from '@mantine/core';
import EmailReplyGenerator from './EmailReplyGenerator';

const ToolsSection = ({ defaultLanguage = 'en' }) => {
  return (
    <Paper shadow="sm" radius="md" p="xl" withBorder>
      <Stack spacing="md">
        <Title order={3}>Additional Tools</Title>
        <Text size="sm" color="dimmed">
          Professional communication tools to assist with your job search
        </Text>

        <Grid>
          <Grid.Col>
            <EmailReplyGenerator defaultLanguage={defaultLanguage} />
          </Grid.Col>
        </Grid>
      </Stack>
    </Paper>
  );
};

export default ToolsSection;
