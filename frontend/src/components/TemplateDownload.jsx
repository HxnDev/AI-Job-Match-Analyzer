import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import { IconFileTypeDocx } from '@tabler/icons-react';

const TemplateDownload = () => {
  return (
    <Paper shadow="sm" radius="md" p="md" withBorder>
      <Stack spacing="xs">
        <Text size="lg" weight={700}>
          Resume Templates
        </Text>
        <Text size="sm" color="dimmed">
          Download our professionally designed resume templates to get started with your job search.
        </Text>

        <Group position="center" mt="sm">
          <Button
            component="a"
            href="/Resume_Template.docx"
            download="Resume_Template.docx"
            leftIcon={<IconFileTypeDocx size={18} />}
            variant="outline"
            color="blue"
          >
            Download DOCX Template
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default TemplateDownload;
