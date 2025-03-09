import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  MantineProvider,
  AppShell,
  Header,
  MediaQuery,
  Burger,
  Group,
  ActionIcon,
  useMantineTheme,
  Title,
  Transition,
  Box,
  Avatar,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { IconMoonStars, IconSun, IconBriefcase } from '@tabler/icons-react';

import Home from './pages/Home';
import EmailTools from './pages/EmailTools';
import TemplateDownloads from './pages/TemplateDownloads';
import InterviewPrep from './pages/InterviewPrep';
import Sidebar from './components/Sidebar';
import { themeConfig } from './theme';

function App() {
  const [opened, setOpened] = useState(false);
  const [colorScheme, setColorScheme] = useState(localStorage.getItem('theme') || 'light');
  const [mounted, setMounted] = useState(false);
  const theme = useMantineTheme();

  // Set mounted state after initial render for transition effects
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleColorScheme = () => {
    const newColorScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newColorScheme);
    localStorage.setItem('theme', newColorScheme);
  };

  // Create a theme object by merging our theme config with the color scheme
  const mergedTheme = {
    ...themeConfig,
    colorScheme,
  };

  return (
    <Transition mounted={mounted} transition="fade" duration={500} timingFunction="ease">
      {(styles) => (
        <div style={styles}>
          <MantineProvider withGlobalStyles withNormalizeCSS theme={mergedTheme}>
            <Notifications position="top-right" />
            <Router>
              <AppShell
                navbarOffsetBreakpoint="sm"
                navbar={<Sidebar opened={opened} />}
                header={
                  <Header height={70} p="md" sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                    <Group position="apart" sx={{ height: '100%' }}>
                      <Group>
                        <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                          <Burger
                            opened={opened}
                            onClick={() => setOpened((o) => !o)}
                            size="sm"
                            color={theme.colors.gray[6]}
                            mr="xl"
                          />
                        </MediaQuery>

                        <Group spacing="xs">
                          <Avatar color="blue" radius="xl">
                            <IconBriefcase size={24} />
                          </Avatar>
                          <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
                            <Link to="/" style={{ textDecoration: 'none' }}>
                              <Title
                                order={3}
                                sx={() => ({
                                  background: 'linear-gradient(45deg, #3498db 0%, #2E86C1 100%)',
                                  backgroundClip: 'text',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  fontWeight: 800,
                                })}
                              >
                                JobFit
                              </Title>
                            </Link>
                          </MediaQuery>
                        </Group>
                      </Group>

                      <Group>
                        <ActionIcon
                          variant="light"
                          color={colorScheme === 'dark' ? 'yellow' : 'blue'}
                          onClick={toggleColorScheme}
                          title="Toggle color scheme"
                          radius="xl"
                          size="lg"
                          sx={{
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'rotate(30deg)',
                            },
                          }}
                        >
                          {colorScheme === 'dark' ? (
                            <IconSun size={18} />
                          ) : (
                            <IconMoonStars size={18} />
                          )}
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Header>
                }
                styles={(theme) => ({
                  main: {
                    backgroundColor:
                      theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                    paddingTop: 70,
                  },
                })}
              >
                <Box
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/email-tools" element={<EmailTools />} />
                    <Route path="/templates" element={<TemplateDownloads />} />
                    <Route path="/interview-prep" element={<InterviewPrep />} />
                  </Routes>
                </Box>
              </AppShell>
            </Router>
          </MantineProvider>
        </div>
      )}
    </Transition>
  );
}

export default App;
