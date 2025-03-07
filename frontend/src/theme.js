/**
 * Application-wide theme configuration for Mantine UI
 */

export const themeConfig = {
  // Color scheme
  colorScheme: 'light',

  // Primary color used across the application
  primaryColor: 'blue',

  // Color overrides
  colors: {
    // Custom blue shade for primary actions
    blue: [
      '#E6F7FF', // 0
      '#BAE7FF', // 1
      '#91D5FF', // 2
      '#69C0FF', // 3
      '#4CB3FF', // 4
      '#3498db', // 5 - Primary blue
      '#2E86C1', // 6
      '#2874A6', // 7
      '#1F618D', // 8
      '#154360', // 9
    ],
    // Accent color for secondary actions
    orange: [
      '#FFF7E6', // 0
      '#FFE7BA', // 1
      '#FFD591', // 2
      '#FFC069', // 3
      '#FFA940', // 4
      '#FF922B', // 5 - Primary orange
      '#D97706', // 6
      '#B45309', // 7
      '#92400E', // 8
      '#78350F', // 9
    ],
    // Success color
    green: [
      '#E6FFFA', // 0
      '#B2F5EA', // 1
      '#81E6D9', // 2
      '#4FD1C5', // 3
      '#38B2AC', // 4
      '#40C057', // 5 - Primary green
      '#2F855A', // 6
      '#276749', // 7
      '#22543D', // 8
      '#1C4532', // 9
    ],
  },

  // Border radius for all components
  defaultRadius: 'md',

  // Font settings
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontFamilyMonospace: 'Monaco, Courier, monospace',

  // Heading font settings
  headings: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontWeight: 700,
    sizes: {
      h1: { fontSize: '2rem', lineHeight: 1.3 },
      h2: { fontSize: '1.5rem', lineHeight: 1.35 },
      h3: { fontSize: '1.25rem', lineHeight: 1.4 },
      h4: { fontSize: '1.125rem', lineHeight: 1.45 },
      h5: { fontSize: '1rem', lineHeight: 1.5 },
      h6: { fontSize: '0.875rem', lineHeight: 1.5 },
    },
  },

  // Shadow presets
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // Component-specific styling
  components: {
    Button: {
      defaultProps: {
        size: 'md',
      },
      styles: (theme) => ({
        root: {
          borderRadius: '8px',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows.md,
          },
        },
      }),
    },
    Paper: {
      styles: (theme) => ({
        root: {
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows.md,
          },
        },
      }),
    },
    Card: {
      styles: (theme) => ({
        root: {
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows.md,
          },
        },
      }),
    },
    Modal: {
      styles: () => ({
        modal: {
          borderRadius: '12px',
        },
      }),
    },
    TextInput: {
      styles: (theme) => ({
        input: {
          borderRadius: '8px',
          '&:focus': {
            borderColor: theme.colors.blue[6],
            boxShadow: `0 0 0 2px ${theme.colors.blue[1]}`,
          },
        },
      }),
    },
    Textarea: {
      styles: (theme) => ({
        input: {
          borderRadius: '8px',
          '&:focus': {
            borderColor: theme.colors.blue[6],
            boxShadow: `0 0 0 2px ${theme.colors.blue[1]}`,
          },
        },
      }),
    },
    Select: {
      styles: (theme) => ({
        input: {
          borderRadius: '8px',
        },
        item: {
          '&[data-selected]': {
            backgroundColor: theme.colors.blue[6],
          },
          '&[data-hovered]': {
            backgroundColor: theme.colors.blue[0],
          },
        },
      }),
    },
    Badge: {
      styles: () => ({
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      }),
    },
    Notification: {
      styles: () => ({
        root: {
          borderRadius: '8px',
        },
      }),
    },
  },
};

// Helper function for consistent gradient buttons
export const gradients = {
  primary: { from: '#3498db', to: '#2980b9' },
  secondary: { from: '#FF922B', to: '#F97316' },
  success: { from: '#40C057', to: '#2F9E44' },
  info: { from: '#228BE6', to: '#1864AB' },
  warning: { from: '#FAB005', to: '#E67700' },
  danger: { from: '#FA5252', to: '#E03131' },
  purple: { from: '#7950F2', to: '#5F3DC4' },
  teal: { from: '#20C997', to: '#0CA678' },
  cyan: { from: '#15AABF', to: '#0C8599' },
};

// Common animation settings
export const animations = {
  transition: 'all 0.3s ease',
  hover: {
    transform: 'translateY(-3px)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
};

// Helper classes for common styling patterns
export const styleHelpers = {
  gradientText: {
    background: 'linear-gradient(45deg, #3498db 0%, #2E86C1 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 700,
  },
  cardHover: {
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
  },
  centerFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
