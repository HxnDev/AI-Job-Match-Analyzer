import React, { useState } from 'react';
import {
  Tabs,
  Stack,
  Text,
  Group,
  useMantineTheme,
  Textarea,
  Paper,
  keyframes,
  Box,
  Center,
  Transition,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconFileText, IconFileUpload, IconCheck, IconCode } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

// Define animations
const bounceIn = keyframes({
  '0%': { transform: 'scale(0.8)', opacity: 0 },
  '70%': { transform: 'scale(1.05)' },
  '100%': { transform: 'scale(1)', opacity: 1 },
});

const ResumeUpload = ({ setResumeFile, resumeText, setResumeText }) => {
  const theme = useMantineTheme();
  const [activeTab, setActiveTab] = useState('upload');
  const [filePreview, setFilePreview] = useState(null);

  const handleFileChange = (files) => {
    if (files.length === 0) return;

    const file = files[0];
    const fileType = file.name.split('.').pop().toLowerCase();

    if (!['pdf', 'txt', 'docx'].includes(fileType)) {
      notifications.show({
        title: 'Invalid File',
        message: 'Please upload a PDF, TXT, or DOCX file',
        color: 'red',
      });
      return;
    }

    setResumeFile(file);
    setFilePreview({
      name: file.name,
      size: (file.size / 1024).toFixed(2), // Convert to KB
      type: fileType.toUpperCase(),
    });

    setResumeText('');

    notifications.show({
      title: 'File Uploaded',
      message: `${file.name} has been successfully uploaded`,
      color: 'green',
    });
  };

  const handleTextChange = (event) => {
    setResumeText(event.currentTarget.value);
    setResumeFile(null);
    setFilePreview(null);
  };

  return (
    <Stack spacing="md">
      <Tabs
        value={activeTab}
        onTabChange={setActiveTab}
        radius="md"
        styles={(theme) => ({
          tabsList: {
            border: 'none',
            gap: theme.spacing.xs,
          },
          tab: {
            fontWeight: 500,
            height: 42,
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
            color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[7],
            border: 'none',
            transition: 'all 0.2s ease',
            '&[data-active]': {
              backgroundColor: theme.colors.blue[7],
              color: theme.white,
            },
            '&:hover': {
              backgroundColor:
                theme.colorScheme === 'dark'
                  ? theme.colors.dark[5]
                  : theme.fn.lighten(theme.colors.blue[0], 0.5),
            },
          },
        })}
      >
        <Tabs.List>
          <Tabs.Tab value="upload" icon={<IconFileUpload size={18} />}>
            Upload File
          </Tabs.Tab>
          <Tabs.Tab value="text" icon={<IconCode size={18} />}>
            Paste Text
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="upload" pt="lg">
          <Transition mounted={activeTab === 'upload'} transition="fade" duration={200}>
            {(styles) => (
              <div style={styles}>
                {filePreview ? (
                  <Paper
                    p="md"
                    radius="md"
                    withBorder
                    sx={{
                      animation: `${bounceIn} 0.5s ease`,
                      backgroundColor:
                        theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.blue[0],
                    }}
                  >
                    <Group position="apart">
                      <Group>
                        <IconFileText size={36} color={theme.colors.blue[6]} />
                        <Stack spacing={2}>
                          <Text weight={600} size="md">
                            {filePreview.name}
                          </Text>
                          <Text size="xs" color="dimmed">
                            {filePreview.type} • {filePreview.size} KB
                          </Text>
                        </Stack>
                      </Group>
                      <Center>
                        <IconCheck size={24} color={theme.colors.green[6]} stroke={3} />
                      </Center>
                    </Group>
                  </Paper>
                ) : (
                  <Dropzone
                    onDrop={handleFileChange}
                    onReject={() =>
                      notifications.show({
                        title: 'Invalid File',
                        message: 'Please upload a valid PDF, TXT, or DOCX file',
                        color: 'red',
                      })
                    }
                    maxSize={3 * 1024 * 1024} // 3MB
                    accept={[
                      'application/pdf',
                      'text/plain',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    ]}
                    styles={(theme) => ({
                      root: {
                        borderWidth: 1,
                        minHeight: 150,
                        borderRadius: theme.radius.md,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: theme.colors.blue[6],
                        },
                      },
                    })}
                  >
                    <Box
                      style={{
                        pointerEvents: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        height: '100%',
                        padding: theme.spacing.md,
                      }}
                    >
                      <IconFileUpload size={36} color={theme.colors.blue[6]} stroke={1.5} />
                      <Text size="lg" weight={500} mt="md">
                        Drop your resume here or click to browse files
                      </Text>
                      <Text size="sm" color="dimmed" mt={7}>
                        Attach your resume as a PDF, TXT, or DOCX file (max 3MB)
                      </Text>
                    </Box>
                  </Dropzone>
                )}

                {filePreview && (
                  <Group position="center" mt="md">
                    <Text
                      size="sm"
                      color="blue"
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                      onClick={() => {
                        setFilePreview(null);
                        setResumeFile(null);
                      }}
                    >
                      Remove file and upload a different one
                    </Text>
                  </Group>
                )}
              </div>
            )}
          </Transition>
        </Tabs.Panel>

        <Tabs.Panel value="text" pt="lg">
          <Transition mounted={activeTab === 'text'} transition="fade" duration={200}>
            {(styles) => (
              <div style={styles}>
                <Textarea
                  placeholder="Copy and paste your resume text here..."
                  minRows={10}
                  maxRows={15}
                  value={resumeText}
                  onChange={handleTextChange}
                  styles={(theme) => ({
                    input: {
                      transition: 'all 0.3s ease',
                      '&:focus': {
                        borderColor: theme.colors.blue[6],
                        boxShadow: `0 0 0 2px ${theme.fn.rgba(theme.colors.blue[6], 0.2)}`,
                      },
                    },
                  })}
                />
                <Text size="xs" color="dimmed" mt="sm">
                  Tip: For best results, ensure all text is formatted cleanly without special
                  characters.
                </Text>
              </div>
            )}
          </Transition>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

export default ResumeUpload;
