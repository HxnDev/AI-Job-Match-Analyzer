import React from 'react';
import { Title, Text, Group, Box, Divider, useMantineTheme, keyframes } from '@mantine/core';
import { styleHelpers } from '../theme';

// Define animation keyframes
const fadeIn = keyframes({
  from: { opacity: 0, transform: 'translateY(-10px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
});

const PageHeader = ({ title, description, icon, extra, withDivider = true }) => {
  const theme = useMantineTheme();

  return (
    <Box
      sx={{
        animation: `${fadeIn} 0.5s ease-out`,
        marginBottom: theme.spacing.lg,
      }}
    >
      <Group position="apart" align="flex-start" mb={description ? 'md' : 'xs'}>
        <Group>
          {icon && (
            <Box
              sx={{
                color: theme.colors.blue[6],
                fontSize: '1.75rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </Box>
          )}
          <Title
            order={1}
            sx={{
              fontSize: '2rem',
              ...styleHelpers.gradientText,
            }}
          >
            {title}
          </Title>
        </Group>

        {extra && <Box>{extra}</Box>}
      </Group>

      {description && (
        <Text
          size="lg"
          color="dimmed"
          sx={{
            maxWidth: 800,
            lineHeight: 1.6,
            animation: `${fadeIn} 0.7s ease-out`,
            animationFillMode: 'backwards',
          }}
        >
          {description}
        </Text>
      )}

      {withDivider && (
        <Divider
          my="lg"
          sx={{
            opacity: 0.6,
            animation: `${fadeIn} 0.9s ease-out`,
            animationFillMode: 'backwards',
          }}
        />
      )}
    </Box>
  );
};

export default PageHeader;
