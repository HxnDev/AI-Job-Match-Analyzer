import React, { useState, useEffect, createContext } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
  Menu,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { IconMoonStars, IconSun, IconBriefcase, IconKey, IconLogout } from '@tabler/icons-react';

import Home from './pages/Home';
import EmailTools from './pages/EmailTools';
import TemplateDownloads from './pages/TemplateDownloads';
import InterviewPrep from './pages/InterviewPrep';
import Sidebar from './components/Sidebar';
import NoticeBanner from './components/NoticeBanner';
import ApiKeyManager from './components/ApiKeyManager';
import { themeConfig } from './theme';
import { hasValidApiKey, clearApiKey } from './utils/apiConfig';

// Create context for API key status
export const ApiKeyContext = createContext({
  hasApiKey: false,
  refreshApiKeyStatus: () => {},
  clearApiKey: () => {},
});

function App() {
  const [opened, setOpened] = useState(false);
  const [colorScheme, setColorScheme] = useState(localStorage.getItem('theme') || 'light');
  const [mounted, setMounted] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const theme = useMantineTheme();

  // Set mounted state after initial render for transition effects
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for API key on component mount
  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  // Function to check API key status
  const checkApiKeyStatus = () => {
    const isValid = hasValidApiKey();
    setHasApiKey(isValid);
    return isValid;
  };

  // Function to clear API key
  const handleClearApiKey = () => {
    clearApiKey();
    checkApiKeyStatus();
  };

  // Function to handle API key save
  const handleApiKeySave = () => {
    checkApiKeyStatus();
  };

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

  // Context value for API key
  const apiKeyContextValue = {
    hasApiKey,
    refreshApiKeyStatus: checkApiKeyStatus,
    clearApiKey: handleClearApiKey,
  };

  return (
    <Transition mounted={mounted} transition="fade" duration={500} timingFunction="ease">
      {(styles) => (
        <div style={styles}>
          <MantineProvider withGlobalStyles withNormalizeCSS theme={mergedTheme}>
            <Notifications position="top-right" />
            <ApiKeyContext.Provider value={apiKeyContextValue}>
              <Router>
                {!hasApiKey ? (
                  // Show API Key input if no valid key exists
                  <ApiKeyManager onSaveSuccess={handleApiKeySave} />
                ) : (
                  // Main application when API key is valid
                  <AppShell
                    navbarOffsetBreakpoint="sm"
                    navbar={<Sidebar opened={opened} />}
                    header={
                      <Header
                        height={70}
                        p="md"
                        sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}
                      >
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
                                      background:
                                        'linear-gradient(45deg, #3498db 0%, #2E86C1 100%)',
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
                            <Menu position="bottom-end" withArrow>
                              <Menu.Target>
                                <ActionIcon
                                  variant="light"
                                  color="blue"
                                  radius="xl"
                                  size="lg"
                                  title="API Key Settings"
                                >
                                  <IconKey size={18} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Label>API Key</Menu.Label>
                                <Menu.Item
                                  icon={<IconLogout size={16} />}
                                  color="red"
                                  onClick={handleClearApiKey}
                                >
                                  Clear API Key
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>

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
                          theme.colorScheme === 'dark'
                            ? theme.colors.dark[8]
                            : theme.colors.gray[0],
                        paddingTop: 70,
                      },
                    })}
                  >
                    <NoticeBanner />
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
                )}
              </Router>
            </ApiKeyContext.Provider>
          </MantineProvider>
        </div>
      )}
    </Transition>
  );
}

export default App;
