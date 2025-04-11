'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import '../../styles.css';
import {
  AppShell,
  Avatar,
  Box,
  Burger,
  Button,
  Flex,
  Group,
  Menu,
  ScrollArea,
  Text,
  Title,
} from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import {
  IconLogout,
  IconMenu2,
  IconNotification,
  IconUserCircle,
} from '@tabler/icons-react';
import { LinksGroup } from './navbar-link-group';
import { useDisclosure, useNetwork } from '@mantine/hooks';
import styles from './shell.module.css';
import { Applications, CurrentApplication } from '../../config/application';
import { UserInfo } from './user-info';
import { getCurrentSession, useAuth } from '@pms/auth';
import { useContext } from 'react';
import DarkModeToggle from '../dark-mode-toggle';
import { ShellContext } from '../../context/shell.context';

interface ShellProps {
  children: React.ReactNode;
}

// Memoize the Shell component to prevent unnecessary re-renders
export const Shell = React.memo(function Shell({ children }: ShellProps) {
  const shellContext = useContext(ShellContext);
  const { logOut, user } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [filterdMenu, setFilterdMenu] = useState<any[]>([]);

  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  // Memoize current application
  const currentApplication = useMemo(
    () => CurrentApplication(shellContext.currentApplication).name,
    [shellContext.currentApplication],
  );

  // Memoize applications menu items
  const applications = useMemo(
    () =>
      Applications.filter(({ name }) => name !== currentApplication).map(
        (item) => (
          <Menu.Item
            component="a"
            href={`/${item?.key}`}
            key={item?.key}
            leftSection={<item.icon size={14} />}
          >
            {item.name}
          </Menu.Item>
        ),
      ),
    [currentApplication],
  );

  const links = shellContext.menuItems.map((item) => (
    <LinksGroup {...item} key={item.label} />
  ));
  const networkStatus = useNetwork();

  // Memoize the session fetch
  const fetchSession = useCallback(async () => {
    const session = await getCurrentSession();
    setUserInfo(session);
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Memoize the header content
  const headerContent = useMemo(
    () => (
      <Group align="center" h="100%" justify="space-between" px="sm">
        <Title fz={16}>{userInfo?.profile?.tenant?.name}</Title>
        <Group gap={8} align="center">
          <IconNotification size={16} />
          <Box className="mt-1">
            <DarkModeToggle />
          </Box>
          <Menu arrowPosition="center" shadow="md" width={200} withArrow>
            <Menu.Target>
              <Button variant="subtle">
                <Box className="flex gap-2 items-center">
                  <Avatar color="primary" radius="xl" size="sm" />
                  <Flex className="flex-col justify-start text-left">
                    <Text lh={1}>{userInfo?.profile?.firstName}</Text>
                  </Flex>
                </Box>
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconUserCircle size={14} />}>
                Profile
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                onClick={logOut}
                color="red"
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    ),
    [userInfo, logOut],
  );

  return (
    <ModalsProvider>
      <Notifications />
      <AppShell
        header={{ height: '48px' }}
        layout="alt"
        navbar={{
          width: 250,
          breakpoint: 'sm',
          collapsed: {
            mobile: !mobileOpened,
            desktop: !desktopOpened,
          },
        }}
        padding="md"
      >
        <AppShell.Header
          style={{
            height: '48px',
            alignItems: 'center',
          }}
        >
          {headerContent}
        </AppShell.Header>
        <AppShell.Navbar className={styles.side}>
          <AppShell.Section>
            <Box className={styles.header}>
              <Box className="flex-grow">
                <Box
                  style={{
                    height: '60px',
                    backgroundColor: '#0b2752',
                    alignItems: 'center',
                    color: 'white',
                  }}
                  className="dark:bg-gray-900"
                >
                  <Group align="center" gap={4} h="100%" className="mx-4">
                    <Burger
                      hiddenFrom="sm"
                      onClick={toggleMobile}
                      opened={mobileOpened}
                      size="sm"
                    />
                    <IconMenu2
                      size={16}
                      onClick={toggleDesktop}
                      style={{
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    />
                    <h2
                      style={{
                        paddingLeft: '20px',
                        paddingBottom: '20px',
                        paddingTop: '20px',
                        fontFamily: 'sans-serif',
                        fontWeight: 'bold',
                        height: '60px',
                      }}
                    >
                      <Menu shadow="md" width={250}>
                        <Menu.Target>
                          <div className="flex items-center gap-1 cursor-pointer">
                            <Text fw={500} fz="md">
                              {currentApplication}
                            </Text>
                          </div>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Label>Applications</Menu.Label>
                          {applications}
                        </Menu.Dropdown>
                      </Menu>
                    </h2>
                  </Group>
                </Box>
                <Burger
                  color="black"
                  hiddenFrom="sm"
                  onClick={toggleMobile}
                  opened={mobileOpened}
                  size="sm"
                />
              </Box>
            </Box>
            <UserInfo user={userInfo} />
          </AppShell.Section>
          <AppShell.Section component={ScrollArea} grow>
            {links}
          </AppShell.Section>
          <AppShell.Section>
            <div className="text-xs border-t p-2">
              <div className="flex justify-between items-center">
                <Text color={networkStatus.online ? 'teal' : 'red'} size="sm">
                  {networkStatus.online ? 'Online' : 'Offline'}
                </Text>
                <div className="text-center">
                  {process.env.NEXT_PUBLIC_VERSION}
                </div>
              </div>
              <div className="flex gap-2 justify-between items-center">
                <Flex gap={'xl'}>
                  <Box>My Company</Box>
                  <Box> &copy; 2025 </Box>
                </Flex>
              </div>
            </div>
          </AppShell.Section>
        </AppShell.Navbar>
        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </ModalsProvider>
  );
});

export default Shell;
