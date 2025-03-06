import { useState, useEffect } from 'react';
import { Paper, Title, Stack, Text, Group, Button, Alert, Container } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import LanguageSelector from './LanguageSelector';

const LanguageSettings = ({ onClose }) => {
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [isSaved, setIsSaved] = useState(false);

  // Load saved preferences when component mounts
  useEffect(() => {
    const savedLanguage = localStorage.getItem('defaultLanguage');
    if (savedLanguage) {
      setDefaultLanguage(savedLanguage);
    }
  }, []);

  const handleSavePreferences = () => {
    // Save preferences to localStorage
    localStorage.setItem('defaultLanguage', defaultLanguage);
    setIsSaved(true);

    // Reset the saved message after 3 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <Container size="md" py="md">
      <Paper shadow="md" radius="md" p="xl" withBorder>
        <Stack spacing="lg">
          <Title order={3}>Language Preferences</Title>

          <Alert icon={<IconInfoCircle size={16} />} color="blue" title="About language settings">
            Set your default language preferences for cover letter generation and other multilingual
            features. You can always change the language when generating specific content.
          </Alert>

          <Stack spacing="md">
            <LanguageSelector
              label="Default Cover Letter Language"
              value={defaultLanguage}
              onChange={setDefaultLanguage}
            />

            <Text size="sm" color="dimmed">
              This setting determines the default language used when generating cover letters.
              Individual cover letter generation will still allow you to select a different
              language.
            </Text>
          </Stack>

          {isSaved && (
            <Alert color="green" title="Settings Saved">
              Your language preferences have been saved successfully.
            </Alert>
          )}

          <Group position="right" spacing="md">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
            <Button onClick={handleSavePreferences}>Save Preferences</Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
};

export default LanguageSettings;
