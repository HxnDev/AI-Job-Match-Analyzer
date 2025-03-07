import React from 'react';
import { Box, Transition } from '@mantine/core';

/**
 * A component that applies consistent fade transitions to its children
 *
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the content
 * @param {React.ReactNode} props.children - Content to be transitioned
 * @param {string} props.transition - Type of transition ('fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'scale')
 * @param {number} props.duration - Transition duration in milliseconds
 * @param {number} props.delay - Delay before transition starts in milliseconds
 * @param {string} props.timingFunction - CSS transition timing function
 */
const FadeTransition = ({
  show = true,
  children,
  transition = 'fade',
  duration = 300,
  delay = 0,
  timingFunction = 'ease',
  ...props
}) => {
  return (
    <Transition
      mounted={show}
      transition={transition}
      duration={duration}
      exitDuration={duration / 2}
      timingFunction={timingFunction}
      delay={delay}
    >
      {(styles) => (
        <Box style={styles} {...props}>
          {children}
        </Box>
      )}
    </Transition>
  );
};

/**
 * A component that staggers transitions for multiple children
 */
export const StaggeredTransition = ({
  show = true,
  children,
  transition = 'fade',
  baseDuration = 300,
  baseDelay = 0,
  staggerDelay = 100,
  timingFunction = 'ease',
}) => {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <FadeTransition
          show={show}
          transition={transition}
          duration={baseDuration}
          delay={baseDelay + index * staggerDelay}
          timingFunction={timingFunction}
          key={index}
        >
          {child}
        </FadeTransition>
      ))}
    </>
  );
};

export default FadeTransition;
