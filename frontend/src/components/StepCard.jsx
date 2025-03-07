import React from 'react';
import { Paper, Group, Title, Badge, ThemeIcon, useMantineTheme, Text, Box } from '@mantine/core';
import { keyframes } from '@emotion/react';

// Define animation keyframes
const slideIn = keyframes({
  from: { opacity: 0, transform: 'translateX(-20px)' },
  to: { opacity: 1, transform: 'translateX(0)' },
});

const StepCard = ({
  title,
  stepNumber,
  icon,
  badge,
  badgeColor = 'blue',
  children,
  isActive = false,
  isCompleted = false,
}) => {
  const theme = useMantineTheme();

  // Determine card style based on state
  const getBorderColor = () => {
    if (isActive) return theme.colors.blue[6];
    if (isCompleted) return theme.colors.green[6];
    return theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3];
  };

  const getBackgroundColor = () => {
    if (isActive) return theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.blue[0];
    if (isCompleted)
      return theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.green[0];
    return undefined; // Default background
  };

  // Determine icon color based on state
  const getIconColor = () => {
    if (isActive) return 'blue';
    if (isCompleted) return 'green';
    return theme.colorScheme === 'dark' ? 'gray' : 'gray';
  };

  return (
    <Paper
      shadow="sm"
      radius="md"
      p="xl"
      withBorder
      sx={{
        borderColor: getBorderColor(),
        borderWidth: isActive ? '2px' : '1px',
        backgroundColor: getBackgroundColor(),
        transition: 'all 0.3s ease',
        animation: `${slideIn} ${0.3 + stepNumber * 0.1}s ease-out`,
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows.md,
        },
      }}
    >
      {/* Step number indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: '-15px',
          left: '20px',
          zIndex: 2,
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : 'white',
          borderRadius: '50%',
          padding: '2px',
        }}
      >
        <ThemeIcon
          size={30}
          radius="xl"
          color={getIconColor()}
          variant={isActive || isCompleted ? 'filled' : 'light'}
        >
          {icon ? icon : <Text weight={700}>{stepNumber}</Text>}
        </ThemeIcon>
      </Box>

      <Group position="apart" mb="md" mt="xs">
        <Title order={3}>{title}</Title>
        {badge && (
          <Badge size="lg" color={badgeColor}>
            {badge}
          </Badge>
        )}
      </Group>

      {children}
    </Paper>
  );
};

export default StepCard;
