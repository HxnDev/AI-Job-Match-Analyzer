import React from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Button,
  SimpleGrid,
  Card,
  Badge,
  Image,
  List,
  ThemeIcon,
} from '@mantine/core';
import { IconFileTypeDocx, IconDownload, IconCheck, IconFileText } from '@tabler/icons-react';

const TemplateDownloads = () => {
  const resumeTemplates = [
    {
      id: 1,
      name: 'Professional Resume',
      description: 'Clean and professional design suitable for most industries',
      format: 'DOCX',
      icon: IconFileTypeDocx,
      fileUrl: '/Resume_Template.docx',
      filename: 'Professional_Resume_Template.docx',
      badges: ['Corporate', 'Clean'],
      previewUrl: '/template_preview.png', // This assumes you have a preview image
    },
    {
      id: 2,
      name: 'ATS-Friendly Template',
      description: 'Optimized for Applicant Tracking Systems with clean formatting',
      format: 'DOCX',
      icon: IconFileTypeDocx,
      fileUrl: '/ATS_Resume_Template.docx',
      filename: 'ATS_Friendly_Resume_Template.docx',
      badges: ['ATS-Optimized', 'Simple'],
      previewUrl: '/ats_template_preview.png',
    },
    {
      id: 3,
      name: 'Cover Letter Template',
      description: 'Matching cover letter template with professional formatting',
      format: 'DOCX',
      icon: IconFileTypeDocx,
      fileUrl: '/Cover_Letter_Template.docx',
      filename: 'Cover_Letter_Template.docx',
      badges: ['Cover Letter', 'Formal'],
      previewUrl: '/cover_letter_preview.png',
    },
  ];

  return (
    <Container size="lg" py="xl">
      <Stack spacing="xl">
        <div>
          <Title order={1} align="center" color="blue">
            Resume Templates
          </Title>
          <Text size="lg" color="dimmed" align="center">
            Download professionally designed templates to get started with your job search
          </Text>
        </div>

        <SimpleGrid cols={3} breakpoints={[{ maxWidth: 'sm', cols: 1 }]} spacing="lg">
          {resumeTemplates.map((template) => (
            <Card key={template.id} shadow="md" radius="md" p="md" withBorder>
              <Card.Section>
                {template.previewUrl ? (
                  <Image
                    src={template.previewUrl}
                    height={160}
                    alt={template.name}
                    withPlaceholder
                  />
                ) : (
                  <div
                    style={{
                      height: 160,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <ThemeIcon size={80} radius="md" color="blue" variant="light">
                      <IconFileText size={40} />
                    </ThemeIcon>
                  </div>
                )}
              </Card.Section>

              <Stack spacing="xs" mt="md">
                <Group position="apart">
                  <Text weight={700}>{template.name}</Text>
                  <Badge variant="outline" color="blue">
                    {template.format}
                  </Badge>
                </Group>

                <Text size="sm" color="dimmed" style={{ minHeight: '40px' }}>
                  {template.description}
                </Text>

                <Group spacing="xs" mt="xs">
                  {template.badges.map((badge, index) => (
                    <Badge key={index} size="sm" variant="dot">
                      {badge}
                    </Badge>
                  ))}
                </Group>

                <Button
                  fullWidth
                  mt="md"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan' }}
                  leftIcon={<IconDownload size={16} />}
                  component="a"
                  href={template.fileUrl}
                  download={template.filename}
                >
                  Download
                </Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>

        <Paper shadow="md" radius="md" p="xl" withBorder>
          <Stack spacing="md">
            <Title order={3}>Resume Tips</Title>
            <Text color="dimmed">
              A well-crafted resume significantly increases your chances of landing an interview.
              Here are some tips to make your resume stand out:
            </Text>

            <List
              spacing="sm"
              icon={
                <ThemeIcon color="blue" radius="xl" size={24}>
                  <IconCheck size={16} />
                </ThemeIcon>
              }
            >
              <List.Item>
                <Text weight={500}>Tailor your resume for each job application</Text>
                <Text size="sm" color="dimmed">
                  Customize your skills and experiences to match the job description
                </Text>
              </List.Item>

              <List.Item>
                <Text weight={500}>Use action verbs and quantify achievements</Text>
                <Text size="sm" color="dimmed">
                  E.g., &quot;Increased sales by 20%&quot; instead of &quot;Responsible for
                  sales&quot;
                </Text>
              </List.Item>

              <List.Item>
                <Text weight={500}>Keep it concise and focused</Text>
                <Text size="sm" color="dimmed">
                  Limit your resume to 1-2 pages, focusing on relevant experiences
                </Text>
              </List.Item>

              <List.Item>
                <Text weight={500}>Use a clean, professional format</Text>
                <Text size="sm" color="dimmed">
                  Ensure consistent formatting, spacing, and readable fonts
                </Text>
              </List.Item>

              <List.Item>
                <Text weight={500}>Include a strong professional summary</Text>
                <Text size="sm" color="dimmed">
                  Highlight your key qualifications and career objectives
                </Text>
              </List.Item>
            </List>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default TemplateDownloads;
