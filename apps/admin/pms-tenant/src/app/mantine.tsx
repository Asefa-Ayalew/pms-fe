'use client';

import { MantineProvider, MantineThemeOverride } from '@mantine/core';
import { theme as baseTheme } from '@pms/theme/mantine';

export default function MantineProviderRegistry({children,}: { children: React.ReactNode;}) {
  const theme: Partial<MantineThemeOverride> = baseTheme;

  return <MantineProvider theme={theme}>{children}</MantineProvider>;
}
