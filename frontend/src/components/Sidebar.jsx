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
  IconBugOff,
  IconBrandLinkedin,
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
  {
    link: 'mailto:hassanshahzad.dev@gmail.com?subject=JobFit%20Feedback&body=Hello%20Hassan,%0A%0AI%20would%20like%20to%20share%20the%20following%20feedback:%0A%0A[Your%20feature%20request,%20bug%20report,%20or%20question%20here]%0A%0AThank%20you!',
    label: 'Contribute Ideas',
    icon: IconBugOff,
    external: true,
  },
];

export function Sidebar({ opened }) {
  const { classes, cx } = useStyles();
  const location = useLocation();

  const links = data.map((item) => {
    const linkContent = (
      <Group>
        <ThemeIcon color="blue" variant="light">
          <item.icon size={18} />
        </ThemeIcon>
        <Text>{item.label}</Text>
      </Group>
    );

    if (item.external) {
      return (
        <a
          className={classes.link}
          href={item.link}
          key={item.label}
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkContent}
        </a>
      );
    }

    return (
      <Link
        className={cx(classes.link, { [classes.linkActive]: location.pathname === item.link })}
        to={item.link}
        key={item.label}
      >
        {linkContent}
      </Link>
    );
  });

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

        <UnstyledButton
          component="a"
          href="https://www.linkedin.com/in/hassan-shahzad-2a6617212/"
          target="_blank"
          className={classes.link}
        >
          <Group>
            <ThemeIcon color="blue" variant="light">
              <IconBrandLinkedin size={18} />
            </ThemeIcon>
            <Text>Connect on LinkedIn</Text>
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
