'use client';
import React, { useState } from 'react';
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
import { IconLogout, IconMenu2, IconUserCircle } from '@tabler/icons-react';
import { LinksGroup } from './navbar-link-group';
import { useDisclosure, useNetwork } from '@mantine/hooks';
import styles from './shell.module.css';
import { appConfig } from 'src/config/menu';
import { Applications } from 'src/config/application';
import { UserInfo } from './user-info';
import DarkModeToggle from '@/utility/dark-mode-toggler';
import { getCurrentSession, useAuth } from '@pms/auth';
import { useContext } from 'react';
import { ShellContext } from '@/context/shell.context';

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps): React.ReactNode {
  const shellContext = useContext(ShellContext);
  const { logOut, user } = useAuth();
  const userInfo = getCurrentSession();

  const links = appConfig.map((item) => (
    <LinksGroup {...item} key={item.label} />
  ));
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const [currentApplication, setCurrentApplication] =
    useState('Training Center');

  const applications = Applications.filter(
    ({ name }) => name !== currentApplication,
  ).map((item) => (
    <Menu.Item
      component="a"
      href={`/${item?.key}`}
      key={item?.key}
      leftSection={<item.icon size={14} />}
    >
      {item.name}
    </Menu.Item>
  ));
  const networkStatus = useNetwork();

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
          <Group align="center" h="100%" justify="space-between" px="sm">
            <Title fz={16}>{userInfo?.tenant?.name}</Title>
            <Group gap={8} align="center">
              <DarkModeToggle />
              <Menu arrowPosition="center" shadow="md" width={200} withArrow>
                <Menu.Target>
                  <Button variant="subtle">
                    <Box className="flex gap-2 items-center">
                      <Avatar color="primary" radius="xl" size="sm" />

                      <Flex className="flex-col justify-start text-left">
                        <Text lh={1}>{userInfo?.firstName}</Text>
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
                    onClick={() => {
                      logOut();
                    }}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
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
                      {currentApplication}
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
            <div className=" text-xs  border-t p-2">
              <div className="flex justify-between items-center">
                <Text color={networkStatus.online ? 'teal' : 'red'} size="sm">
                  {networkStatus.online ? 'Online' : 'Offline'}
                </Text>
                <div className="text-center">
                  {process.env.NEXT_PUBLIC_VERSION}
                </div>{' '}
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
}

export default Shell;
