import React from 'react';
import { Paper, Text, Button, Group, ThemeIcon, useMantineTheme, Box } from '@mantine/core';
import { keyframes } from '@emotion/react';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

// Define animations
const shake = keyframes({
  '0%': { transform: 'translateX(0)' },
  '25%': { transform: 'translateX(5px)' },
  '50%': { transform: 'translateX(-5px)' },
  '75%': { transform: 'translateX(5px)' },
  '100%': { transform: 'translateX(0)' },
});

const ErrorDisplay = ({
  title = 'Something went wrong',
  message = 'An error occurred while processing your request.',
  onRetry,
  error,
  showDetails = false,
}) => {
  const theme = useMantineTheme();

  return (
    <Paper
      shadow="md"
      radius="md"
      p="xl"
      withBorder
      sx={{
        borderColor: theme.colors.red[6],
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.red[0],
        animation: `${shake} 0.5s ease-in-out`,
      }}
    >
      <Group align="flex-start" spacing="md">
        <ThemeIcon size={40} radius="md" color="red" variant="light">
          <IconAlertTriangle size={24} />
        </ThemeIcon>

        <Box sx={{ flex: 1 }}>
          <Text size="xl" weight={700} mb="xs" color="red">
            {title}
          </Text>

          <Text mb="md" color="dimmed">
            {message}
          </Text>

          {error && showDetails && (
            <Paper
              p="sm"
              withBorder
              mb="md"
              sx={{
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : 'white',
                maxHeight: 120,
                overflow: 'auto',
              }}
            >
              <Text size="sm" color="dimmed" family="monospace">
                {typeof error === 'object' ? error.message || JSON.stringify(error) : error}
              </Text>
            </Paper>
          )}

          {onRetry && (
            <Button
              leftIcon={<IconRefresh size={16} />}
              color="red"
              variant="light"
              onClick={onRetry}
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  backgroundColor: theme.colors.red[1],
                },
              }}
            >
              Try Again
            </Button>
          )}
        </Box>
      </Group>
    </Paper>
  );
};

export default ErrorDisplay;
