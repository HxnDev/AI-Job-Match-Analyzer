import React from 'react';
import { Paper, Text, Group, useMantineTheme } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

/**
 * Banner to display important notices to users
 */
const NoticeBanner = () => {
  const theme = useMantineTheme();

  return (
    <Paper
      p="md"
      withBorder
      shadow="sm"
      sx={{
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.blue[9] : theme.colors.blue[0],
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        marginBottom: theme.spacing.md,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Group spacing="xs">
        <IconAlertCircle
          size={20}
          color={theme.colorScheme === 'dark' ? theme.colors.blue[2] : theme.colors.blue[6]}
        />
        <Text
          size="sm"
          weight={500}
          color={theme.colorScheme === 'dark' ? theme.white : theme.black}
        >
          Important Notice: The job analysis using direct links feature has been removed due to
          stronger anti-scraping measures implemented by Indeed, LinkedIn, and other job platforms.
          Please paste job descriptions directly instead for best results.
        </Text>
      </Group>
    </Paper>
  );
};

export default NoticeBanner;
