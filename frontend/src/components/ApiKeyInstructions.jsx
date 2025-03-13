import React from 'react';
import {
  Paper,
  Text,
  Title,
  Stack,
  List,
  Anchor,
  Group,
  ThemeIcon,
  Divider,
  Alert,
  Accordion,
  Button,
  SimpleGrid,
  Card,
  Box,
} from '@mantine/core';
import {
  IconExternalLink,
  IconBulb,
  IconKey,
  IconShieldLock,
  IconBrandGoogle,
  IconNumber1,
  IconNumber2,
  IconNumber3,
  IconNumber4,
  IconNumber5,
} from '@tabler/icons-react';

/**
 * Detailed step-by-step instructions for obtaining a Google Gemini API key
 */
const ApiKeyInstructions = () => {
  return (
    <Paper shadow="md" radius="md" p="xl" withBorder>
      <Stack spacing="lg">
        <Title order={2}>How to Get Your Google Gemini API Key</Title>
        <Text size="md" color="dimmed">
          Follow these steps to obtain a free API key from Google AI Studio
        </Text>

        <Divider />

        <SimpleGrid cols={1} spacing="lg">
          <Card withBorder p="lg" radius="md">
            <Group spacing="sm" align="flex-start" mb="md">
              <ThemeIcon radius="xl" size="xl" color="blue">
                <IconNumber1 size={24} />
              </ThemeIcon>
              <div>
                <Title order={4}>Visit Google AI Studio</Title>
                <Text>
                  Go to{' '}
                  <Anchor
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google AI Studio <IconExternalLink size={14} />
                  </Anchor>{' '}
                  and sign in with your Google account.
                </Text>
              </div>
            </Group>
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <div
                style={{
                  maxWidth: '500px',
                  margin: '0 auto',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <img
                  src="/api/placeholder/500/300"
                  alt="Google AI Studio Homepage"
                  style={{ width: '100%' }}
                />
              </div>
              <Text size="sm" color="dimmed" mt="xs">
                Google AI Studio homepage
              </Text>
            </Box>
          </Card>

          <Card withBorder p="lg" radius="md">
            <Group spacing="sm" align="flex-start" mb="md">
              <ThemeIcon radius="xl" size="xl" color="blue">
                <IconNumber2 size={24} />
              </ThemeIcon>
              <div>
                <Title order={4}>Navigate to API Keys</Title>
                <Text>
                  In the left sidebar, click on &quot;API keys&quot; or look for the API management
                  section.
                </Text>
              </div>
            </Group>
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <div
                style={{
                  maxWidth: '500px',
                  margin: '0 auto',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <img
                  src="/api/placeholder/500/300"
                  alt="Google API Keys section"
                  style={{ width: '100%' }}
                />
              </div>
              <Text size="sm" color="dimmed" mt="xs">
                API Keys section in Google AI Studio
              </Text>
            </Box>
          </Card>

          <Card withBorder p="lg" radius="md">
            <Group spacing="sm" align="flex-start" mb="md">
              <ThemeIcon radius="xl" size="xl" color="blue">
                <IconNumber3 size={24} />
              </ThemeIcon>
              <div>
                <Title order={4}>Create a New API Key</Title>
                <Text>
                  Click on &quot;Create API Key&quot; button to generate a new key for your project.
                </Text>
              </div>
            </Group>
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <div
                style={{
                  maxWidth: '500px',
                  margin: '0 auto',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <img
                  src="/api/placeholder/500/300"
                  alt="Create API Key button"
                  style={{ width: '100%' }}
                />
              </div>
              <Text size="sm" color="dimmed" mt="xs">
                Create API Key button
              </Text>
            </Box>
          </Card>

          <Card withBorder p="lg" radius="md">
            <Group spacing="sm" align="flex-start" mb="md">
              <ThemeIcon radius="xl" size="xl" color="blue">
                <IconNumber4 size={24} />
              </ThemeIcon>
              <div>
                <Title order={4}>Copy Your API Key</Title>
                <Text>
                  Once generated, copy the API key. Important: This key will be shown only once!
                </Text>
              </div>
            </Group>
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <div
                style={{
                  maxWidth: '500px',
                  margin: '0 auto',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <img src="/api/placeholder/500/300" alt="Copy API Key" style={{ width: '100%' }} />
              </div>
              <Text size="sm" color="dimmed" mt="xs">
                Copy your newly created API key
              </Text>
            </Box>
          </Card>

          <Card withBorder p="lg" radius="md">
            <Group spacing="sm" align="flex-start" mb="md">
              <ThemeIcon radius="xl" size="xl" color="blue">
                <IconNumber5 size={24} />
              </ThemeIcon>
              <div>
                <Title order={4}>Paste Your API Key in JobFit</Title>
                <Text>
                  Return to JobFit and paste the key into the API Key field to start using the
                  application.
                </Text>
              </div>
            </Group>
          </Card>
        </SimpleGrid>

        <Divider />

        <Alert icon={<IconBulb size={16} />} title="Free Usage Limits" color="blue">
          <Text size="sm">
            Google Gemini API offers a generous free tier. As of March 2025, you get:
          </Text>
          <List size="sm" spacing="xs" my="sm">
            <List.Item>Limited free calls per minute and per day</List.Item>
            <List.Item>Access to the standard Gemini model</List.Item>
            <List.Item>No credit card required for basic usage</List.Item>
          </List>
          <Text size="sm">
            For the most up-to-date information, visit the{' '}
            <Anchor href="https://ai.google.dev/pricing" target="_blank" rel="noopener noreferrer">
              Google AI pricing page <IconExternalLink size={14} />
            </Anchor>
          </Text>
        </Alert>

        <Accordion>
          <Accordion.Item value="security">
            <Accordion.Control icon={<IconShieldLock size={20} />}>
              Security Information
            </Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="md">
                <Text>
                  Your API key is stored securely in your browser&apos;s local storage and is only
                  used to make requests to Google&apos;s API through our backend.
                </Text>
                <List>
                  <List.Item>We never store your API key on our servers</List.Item>
                  <List.Item>Your key is transmitted securely via HTTPS</List.Item>
                  <List.Item>You can remove the key from your browser at any time</List.Item>
                  <List.Item>
                    We recommend using a separate API key for different applications
                  </List.Item>
                </List>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="troubleshooting">
            <Accordion.Control icon={<IconKey size={20} />}>
              Troubleshooting API Key Issues
            </Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="md">
                <Text>If you&apos;re experiencing issues with your API key:</Text>
                <List>
                  <List.Item>Ensure you&apos;ve copied the entire key without spaces</List.Item>
                  <List.Item>Check if you&apos;ve reached your usage limits</List.Item>
                  <List.Item>Try generating a new API key</List.Item>
                  <List.Item>Clear your browser cache and cookies</List.Item>
                  <List.Item>Check your internet connection</List.Item>
                </List>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Group position="center">
          <Button
            component="a"
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            leftIcon={<IconBrandGoogle size={16} />}
            variant="outline"
            color="blue"
          >
            Go to Google AI Studio
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default ApiKeyInstructions;
