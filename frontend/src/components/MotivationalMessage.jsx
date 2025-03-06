import React, { useState } from 'react';
import { Button, TextInput, Modal, Group, Stack, Text, Paper, Badge, Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconLanguage, IconBulb } from '@tabler/icons-react';
import LanguageSelector from './LanguageSelector';
import axios from 'axios';

const MotivationalMessage = ({ jobTitle }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [langMenuOpened, setLangMenuOpened] = useState(false);

  // Get language label for display
  const getLanguageLabel = (code) => {
    const languageMap = {
      en: 'English',
      es: 'Spanish (Español)',
      fr: 'French (Français)',
      de: 'German (Deutsch)',
      zh: 'Chinese (中文)',
      ja: 'Japanese (日本語)',
      pt: 'Portuguese (Português)',
      ru: 'Russian (Русский)',
      ar: 'Arabic (العربية)',
    };
    return languageMap[code] || 'English';
  };

  const handleGenerateMessage = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5050/api/motivational-message', {
        job_title: customJobTitle || jobTitle || 'Software Developer',
        language: selectedLanguage,
      });

      if (response.data.success) {
        setMessage(response.data.message);
      } else {
        throw new Error(response.data.error || 'Failed to generate message');
      }
    } catch (error) {
      console.error('Error generating motivational message:', error);
      setMessage(
        'Sorry, we could not generate a motivational message at this time. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setCustomJobTitle(jobTitle || '');
    setMessage('');
    open();
  };

  return (
    <>
      <Button
        leftIcon={<IconBulb size={16} />}
        variant="light"
        color="yellow"
        onClick={handleOpen}
        fullWidth
      >
        Get Motivational Message
      </Button>

      <Modal
        opened={opened}
        onClose={close}
        title={
          <Group>
            <Text>Motivational Message</Text>
            <Badge color="yellow">{getLanguageLabel(selectedLanguage)}</Badge>
          </Group>
        }
        size="lg"
      >
        <Stack spacing="md">
          <Group grow align="flex-end">
            <TextInput
              label="Job Title"
              value={customJobTitle}
              onChange={(e) => setCustomJobTitle(e.target.value)}
              placeholder="Enter the job title"
            />
            <Menu
              opened={langMenuOpened}
              onChange={setLangMenuOpened}
              position="bottom-end"
              withinPortal
            >
              <Menu.Target>
                <Button
                  variant="outline"
                  rightIcon={<IconChevronDown size={16} />}
                  leftIcon={<IconLanguage size={16} />}
                >
                  {getLanguageLabel(selectedLanguage)}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Select Language</Menu.Label>
                {['en', 'es', 'fr', 'de', 'zh', 'ja', 'pt', 'ru', 'ar'].map((code) => (
                  <Menu.Item
                    key={code}
                    onClick={() => setSelectedLanguage(code)}
                    icon={code === selectedLanguage ? '✓' : null}
                  >
                    {getLanguageLabel(code)}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </Group>

          <Group position="right">
            <Button onClick={handleGenerateMessage} loading={loading} disabled={!customJobTitle}>
              Generate Message
            </Button>
          </Group>

          {message && (
            <Paper p="md" withBorder>
              <Text style={{ whiteSpace: 'pre-line' }}>{message}</Text>
            </Paper>
          )}
        </Stack>
      </Modal>
    </>
  );
};

export default MotivationalMessage;
