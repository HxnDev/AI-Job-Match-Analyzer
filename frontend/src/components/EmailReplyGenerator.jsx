import React, { useState, useEffect } from 'react';
import {
  Button,
  Textarea,
  Modal,
  Group,
  Stack,
  Text,
  Paper,
  Badge,
  SegmentedControl,
  ActionIcon,
  CopyButton,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconCopy, IconMail } from '@tabler/icons-react';
import LanguageSelector from './LanguageSelector';
import axios from 'axios';
import { getApiUrl, getApiKey } from '../utils/apiConfig';

const EmailReplyGenerator = ({ defaultLanguage = 'en' }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [emailContent, setEmailContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [availableTones, setAvailableTones] = useState([
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'formal', label: 'Formal' },
  ]);
  // Removed unused error state variable

  // Update language when defaultLanguage prop changes
  useEffect(() => {
    setSelectedLanguage(defaultLanguage);
  }, [defaultLanguage]);

  // Fetch available email tones when component mounts
  useEffect(() => {
    const fetchTones = async () => {
      try {
        // Get the API key
        const apiKey = getApiKey();
        if (!apiKey) {
          console.warn('No API key available for fetching email tones');
          return;
        }

        const response = await axios.get(getApiUrl('email-tones'), {
          headers: {
            'X-API-KEY': apiKey,
          },
        });

        if (response.data.success) {
          setAvailableTones(
            response.data.tones.map((tone) => ({
              value: tone.code,
              label: tone.name,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching email tones:', error);
        // We'll keep the default tones already set
      }
    };

    fetchTones();
  }, []);

  const handleGenerateReply = async () => {
    if (!emailContent.trim()) {
      return;
    }

    setLoading(true);
    // Removed setError(null) since we're not using error state

    try {
      // Get the API key
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('No API key available');
      }

      const response = await axios.post(
        getApiUrl('email-reply'),
        {
          email_content: emailContent,
          tone: selectedTone,
          language: selectedLanguage,
        },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );

      if (response.data.success) {
        setReplyContent(response.data.reply);
      } else {
        throw new Error(response.data.error || 'Failed to generate email reply');
      }
    } catch (error) {
      console.error('Error generating email reply:', error);
      setReplyContent(
        'Sorry, we could not generate an email reply at this time. Please try again later.'
      );
      // Removed setError since we're not using error state
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setEmailContent('');
    setReplyContent('');
    open();
  };

  // Get language label for display
  const getLanguageLabel = (code) => {
    const languageMap = {
      en: 'English',
      es: 'Spanish (Español)',
      fr: 'French (Français)',
      de: 'German (Deutsch)',
      zh: 'Chinese (中文)',
      ru: 'Russian (Русский)',
      ar: 'Arabic (العربية)',
    };
    return languageMap[code] || 'English';
  };

  return (
    <>
      <Button
        leftIcon={<IconMail size={16} />}
        variant="light"
        color="indigo"
        onClick={handleOpen}
        fullWidth
      >
        Email Reply Generator
      </Button>

      <Modal
        opened={opened}
        onClose={close}
        title={
          <Group>
            <Text>Professional Email Reply Generator</Text>
            <Badge color="indigo">{getLanguageLabel(selectedLanguage)}</Badge>
          </Group>
        }
        size="xl"
      >
        <Stack spacing="md">
          <Textarea
            label="Paste the Email You Received"
            placeholder="Dear [Your Name], I am writing to inquire about..."
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            minRows={6}
            required
          />

          <Group position="apart">
            <SegmentedControl
              value={selectedTone}
              onChange={setSelectedTone}
              data={availableTones}
              size="sm"
            />
            <LanguageSelector value={selectedLanguage} onChange={setSelectedLanguage} label="" />
          </Group>

          <Group position="right">
            <Button onClick={handleGenerateReply} loading={loading} disabled={!emailContent.trim()}>
              Generate Reply
            </Button>
          </Group>

          {replyContent && (
            <Paper p="md" withBorder>
              <Group position="right" mb="xs">
                <CopyButton value={replyContent} timeout={2000}>
                  {({ copied, copy }) => (
                    <Tooltip
                      label={copied ? 'Copied' : 'Copy to clipboard'}
                      withArrow
                      position="left"
                    >
                      <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
              <Text style={{ whiteSpace: 'pre-line' }}>{replyContent}</Text>
            </Paper>
          )}
        </Stack>
      </Modal>
    </>
  );
};

export default EmailReplyGenerator;
