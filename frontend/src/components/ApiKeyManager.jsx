import React, { useState } from 'react';
import {
  Paper,
  TextInput,
  Button,
  Text,
  Group,
  Stack,
  Alert,
  Container,
  Title,
  Accordion,
  Anchor,
  ThemeIcon,
  List,
  Divider,
  Card,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconKey,
  IconCheck,
  IconExternalLink,
  IconInfoCircle,
  IconLink,
} from '@tabler/icons-react';
import { saveApiKey, validateApiKey } from '../utils/apiConfig';

/**
 * Component for managing Google Gemini API Key
 * Allows users to input and save their API key
 */
const ApiKeyManager = ({ onSaveSuccess }) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate API key format
    if (!validateApiKey(apiKey)) {
      setError('Please enter a valid Google Gemini API key (starts with "AI")');
      return;
    }

    setLoading(true);

    // In a production environment, we might want to verify the API key works
    // For now, we'll just save it and trust that it's valid
    setTimeout(() => {
      const success = saveApiKey(apiKey);

      if (success) {
        notifications.show({
          title: 'API Key Saved',
          message: 'Your API key has been saved successfully',
          color: 'green',
        });

        if (typeof onSaveSuccess === 'function') {
          onSaveSuccess(apiKey);
        }
      } else {
        setError('Failed to save API key. Please try again or check browser storage permissions.');
      }

      setLoading(false);
    }, 500);
  };

  return (
    <Container size="md" py="xl">
      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Stack spacing="lg">
          <Title order={2} align="center">
            Welcome to JobFit
          </Title>

          <Alert icon={<IconInfoCircle size={16} />} color="blue" title="API Key Required">
            JobFit uses Google&apos;s Gemini AI to analyze resumes and generate job-specific
            content. You&apos;ll need to provide your own Google Gemini API key to use this
            application.
          </Alert>

          <form onSubmit={handleSubmit}>
            <Stack spacing="md">
              <TextInput
                required
                label="Google Gemini API Key"
                placeholder="Enter your API key (starts with AI...)"
                icon={<IconKey size={16} />}
                value={apiKey}
                onChange={(e) => setApiKey(e.currentTarget.value)}
                error={error}
                autoComplete="off"
              />

              <Button type="submit" fullWidth loading={loading} leftIcon={<IconCheck size={16} />}>
                Save API Key & Continue
              </Button>
            </Stack>
          </form>

          <Divider label="API Key Instructions" labelPosition="center" />

          <Accordion>
            <Accordion.Item value="how-to-get">
              <Accordion.Control>How to get a Google Gemini API Key</Accordion.Control>
              <Accordion.Panel>
                <Stack spacing="md">
                  <Text>Follow these steps to obtain your free Google Gemini API key:</Text>

                  <List>
                    <List.Item>
                      Visit{' '}
                      <Anchor
                        href="https://aistudio.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Google AI Studio <IconExternalLink size={14} />
                      </Anchor>
                    </List.Item>
                    <List.Item>Sign in with your Google account</List.Item>
                    <List.Item>Navigate to the API Keys section</List.Item>
                    <List.Item>
                      Click &quot;Create API Key&quot; and copy the generated key
                    </List.Item>
                    <List.Item>Paste the key in the field above</List.Item>
                  </List>

                  <Alert color="yellow" title="Important Notes">
                    <List size="sm">
                      <List.Item>Google Gemini offers free API usage within limits</List.Item>
                      <List.Item>
                        Your API key is stored only in your browser&apos;s local storage
                      </List.Item>
                      <List.Item>We never store your API key on our servers</List.Item>
                    </List>
                  </Alert>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="privacy">
              <Accordion.Control>Privacy & Security Information</Accordion.Control>
              <Accordion.Panel>
                <Stack spacing="md">
                  <Text>Here&apos;s how we handle your API key and data:</Text>

                  <Card withBorder p="sm">
                    <Group>
                      <ThemeIcon color="green" size="lg" radius="xl">
                        <IconCheck size={20} />
                      </ThemeIcon>
                      <div>
                        <Text weight={500}>Local Storage Only</Text>
                        <Text size="sm">
                          Your API key is stored only in your browser&apos;s local storage, not on
                          our servers.
                        </Text>
                      </div>
                    </Group>
                  </Card>

                  <Card withBorder p="sm">
                    <Group>
                      <ThemeIcon color="green" size="lg" radius="xl">
                        <IconCheck size={20} />
                      </ThemeIcon>
                      <div>
                        <Text weight={500}>Secure Transmission</Text>
                        <Text size="sm">
                          Your API key is sent securely with HTTPS for all API requests.
                        </Text>
                      </div>
                    </Group>
                  </Card>

                  <Card withBorder p="sm">
                    <Group>
                      <ThemeIcon color="green" size="lg" radius="xl">
                        <IconCheck size={20} />
                      </ThemeIcon>
                      <div>
                        <Text weight={500}>No Server-Side Storage</Text>
                        <Text size="sm">
                          We process your requests on-demand without storing data.
                        </Text>
                      </div>
                    </Group>
                  </Card>

                  <Alert color="blue" title="Remember">
                    You can remove your API key at any time by clearing your browser&apos;s local
                    storage or using your browser&apos;s developer tools.
                  </Alert>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="troubleshooting">
              <Accordion.Control>Troubleshooting</Accordion.Control>
              <Accordion.Panel>
                <Stack spacing="md">
                  <Text>If you encounter issues with your API key:</Text>

                  <List>
                    <List.Item>
                      Ensure you&apos;ve copied the entire API key without any extra spaces
                    </List.Item>
                    <List.Item>
                      Verify the API key is active in your Google AI Studio dashboard
                    </List.Item>
                    <List.Item>
                      Check that you haven&apos;t exceeded your API usage limits
                    </List.Item>
                    <List.Item>Try clearing your browser cache and reloading the page</List.Item>
                    <List.Item>If problems persist, generate a new API key</List.Item>
                  </List>

                  <Group position="center">
                    <Button
                      component="a"
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outline"
                      leftIcon={<IconLink size={16} />}
                    >
                      Visit Google AI Studio
                    </Button>
                  </Group>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ApiKeyManager;
