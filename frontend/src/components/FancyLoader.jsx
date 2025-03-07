import React from 'react';
import { Box, Text, Loader, Overlay, useMantineTheme, keyframes } from '@mantine/core';
import { styleHelpers } from '../theme';

// Define animations
const pulse = keyframes({
  '0%': { opacity: 0.6 },
  '50%': { opacity: 0.8 },
  '100%': { opacity: 0.6 },
});

const float = keyframes({
  '0%': { transform: 'translateY(0px)' },
  '50%': { transform: 'translateY(-10px)' },
  '100%': { transform: 'translateY(0px)' },
});

const FancyLoader = ({ visible, message = 'Processing your request...', overlayProps = {} }) => {
  const theme = useMantineTheme();

  if (!visible) return null;

  return (
    <Overlay
      blur={2}
      center
      zIndex={1000}
      radius="md"
      color={theme.colorScheme === 'dark' ? theme.colors.dark[9] : 'rgba(255, 255, 255, 0.95)'}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
      }}
      {...overlayProps}
    >
      <Box
        sx={{
          ...styleHelpers.centerFlex,
          flexDirection: 'column',
          textAlign: 'center',
          animation: `${float} 3s ease-in-out infinite`,
        }}
      >
        <Loader size="lg" color="blue" variant="dots" />

        <Text
          mt="md"
          mb={5}
          weight={600}
          size="lg"
          sx={{
            ...styleHelpers.gradientText,
          }}
        >
          Working on it...
        </Text>

        <Text
          color="dimmed"
          size="sm"
          sx={{
            maxWidth: 400,
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          {message}
        </Text>
      </Box>
    </Overlay>
  );
};

export default FancyLoader;
