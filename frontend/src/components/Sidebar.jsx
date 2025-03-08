import React from 'react';
import {
  createStyles,
  Navbar,
  Group,
  UnstyledButton,
  Text,
  ThemeIcon,
  Title,
  Divider,
} from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import {
  IconHome2,
  IconFileDownload,
  IconMail,
  IconBrandGithub,
  IconMessageCircle,
} from '@tabler/icons-react';

const useStyles = createStyles((theme) => ({
  link: {
    display: 'flex',
    alignItems: 'center',
    height: '48px',
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,
    borderRadius: theme.radius.md,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },

  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
    },
  },

  footer: {
    borderTop: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
    paddingTop: theme.spacing.md,
  },
}));

const data = [
  { link: '/', label: 'Job Fit Analysis', icon: IconHome2 },
  { link: '/templates', label: 'Resume Templates', icon: IconFileDownload },
  { link: '/email-tools', label: 'Email Tools', icon: IconMail },
  { link: '/interview-prep', label: 'Interview Preparation', icon: IconMessageCircle },
];

export function Sidebar({ opened }) {
  const { classes, cx } = useStyles();
  const location = useLocation();

  const links = data.map((item) => (
    <Link
      className={cx(classes.link, { [classes.linkActive]: location.pathname === item.link })}
      to={item.link}
      key={item.label}
    >
      <Group>
        <ThemeIcon color="blue" variant="light">
          <item.icon size={18} />
        </ThemeIcon>
        <Text>{item.label}</Text>
      </Group>
    </Link>
  ));

  return (
    <Navbar width={{ sm: 250 }} p="md" hiddenBreakpoint="sm" hidden={!opened}>
      <Navbar.Section grow>
        <Group position="apart" align="center" mb={30}>
          <Title order={3} color="blue">
            JobFit
          </Title>
        </Group>
        {links}
      </Navbar.Section>

      <Navbar.Section className={classes.footer}>
        <UnstyledButton
          component="a"
          href="https://github.com/HxnDev/Job-Match-Analyzer"
          target="_blank"
          className={classes.link}
        >
          <Group>
            <ThemeIcon color="gray" variant="light">
              <IconBrandGithub size={18} />
            </ThemeIcon>
            <Text>GitHub Repository</Text>
          </Group>
        </UnstyledButton>
        <Divider my="md" />
        <Text size="xs" color="dimmed" align="center">
          © 2025 JobFit | All rights reserved
        </Text>
      </Navbar.Section>
    </Navbar>
  );
}

export default Sidebar;
