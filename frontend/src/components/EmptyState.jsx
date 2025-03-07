import React from 'react';
import { Box, Text, Button, useMantineTheme, Center, Group } from '@mantine/core';
import { keyframes } from '@emotion/react';
import { styleHelpers } from '../theme';

// Define animations
const fadeIn = keyframes({
  from: { opacity: 0, transform: 'scale(0.9)' },
  to: { opacity: 1, transform: 'scale(1)' },
});

const float = keyframes({
  '0%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-10px)' },
  '100%': { transform: 'translateY(0)' },
});

const EmptyState = ({
  title = 'No data found',
  description = 'There are no items to display.',
  icon,
  actionLabel,
  onAction,
  centered = true,
}) => {
  const theme = useMantineTheme();

  const content = (
    <Box
      sx={{
        textAlign: 'center',
        padding: theme.spacing.xl,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        animation: `${fadeIn} 0.5s ease-out`,
        maxWidth: 500,
        margin: centered ? 'auto' : undefined,
      }}
    >
      {icon && (
        <Box
          sx={{
            marginBottom: theme.spacing.md,
            color: theme.colors.blue[6],
            animation: `${float} 3s ease-in-out infinite`,
            fontSize: '3rem',
            ...styleHelpers.centerFlex,
          }}
        >
          {icon}
        </Box>
      )}

      <Text
        weight={700}
        size="xl"
        mb="sm"
        sx={{
          ...styleHelpers.gradientText,
        }}
      >
        {title}
      </Text>

      <Text color="dimmed" mb={actionLabel ? 'xl' : 0}>
        {description}
      </Text>

      {actionLabel && onAction && (
        <Group position="center" mt="md">
          <Button
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
            onClick={onAction}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: theme.shadows.md,
              },
            }}
          >
            {actionLabel}
          </Button>
        </Group>
      )}
    </Box>
  );

  if (centered) {
    return <Center style={{ width: '100%', minHeight: 300 }}>{content}</Center>;
  }

  return content;
};

export default EmptyState;
