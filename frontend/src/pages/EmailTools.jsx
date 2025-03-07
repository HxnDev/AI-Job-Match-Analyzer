import React from 'react';
import { Container, Title, Text, Stack, Paper, Group, Divider } from '@mantine/core';
import EmailReplyGenerator from '../components/EmailReplyGenerator';

const EmailTools = () => {
  // Get default language from localStorage if available
  const defaultLanguage = localStorage.getItem('defaultLanguage') || 'en';

  return (
    <Container size="lg" py="xl">
      <Stack spacing="xl">
        <div>
          <Title order={1} align="center" color="blue">
            Email Tools
          </Title>
          <Text size="lg" color="dimmed" align="center">
            Professional communication tools to assist with your job search
          </Text>
        </div>

        <Paper shadow="md" radius="md" p="xl" withBorder>
          <Stack spacing="md">
            <Group position="apart">
              <Title order={3}>Email Reply Generator</Title>
            </Group>

            <Text color="dimmed">
              Generate professional email replies to recruiters, follow-ups, and other job-related
              communications. Customize your tone and language to match the context of your
              conversation.
            </Text>

            <Divider my="md" />

            <EmailReplyGenerator defaultLanguage={defaultLanguage} />
          </Stack>
        </Paper>

        <Paper shadow="md" radius="md" p="xl" withBorder>
          <Stack spacing="md">
            <Group position="apart">
              <Title order={3}>Email Tips</Title>
            </Group>

            <Text color="dimmed">
              Professional communication is critical during your job search. Here are some tips to
              make your emails stand out:
            </Text>

            <Stack spacing="xs">
              <Text weight={500}>✓ Keep your emails concise and focused</Text>
              <Text>
                Recruiters and hiring managers receive dozens of emails daily. Keep your message
                clear and to the point.
              </Text>

              <Text weight={500} mt="md">
                ✓ Use a professional subject line
              </Text>
              <Text>
                Include the position title and your name to make your email easily identifiable.
              </Text>

              <Text weight={500} mt="md">
                ✓ Proofread before sending
              </Text>
              <Text>
                Typos and grammatical errors can create a negative impression. Always review your
                email before sending.
              </Text>

              <Text weight={500} mt="md">
                ✓ Include a professional signature
              </Text>
              <Text>
                Add your contact information, LinkedIn profile, and portfolio link (if applicable)
                to make it easy for employers to reach you.
              </Text>

              <Text weight={500} mt="md">
                ✓ Follow up appropriately
              </Text>
              <Text>
                If you don&apos;t receive a response, a polite follow-up email after 1-2 weeks is
                acceptable. Avoid sending multiple follow-ups.
              </Text>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default EmailTools;
