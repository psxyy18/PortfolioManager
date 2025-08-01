import * as React from 'react';
import { NextAppProvider } from '@toolpad/core/nextjs';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StarIcon from '@mui/icons-material/Star';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BugReportIcon from '@mui/icons-material/BugReport';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import type { Navigation, Branding } from '@toolpad/core/AppProvider';
import { SessionProvider, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import theme from '../theme';
import { auth } from '../auth';
import { GlobalPortfolioProvider } from '../contexts/GlobalPortfolioContext';

const NAVIGATION: Navigation = [
  // {
  //   kind: 'header',
  //   title: '📈 Portfolio Trading',
  // },
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'details',
    title: 'Trading Platform',
    icon: <TrendingUpIcon />,
  },
  // {
  //   segment: 'data-test',
  //   title: 'Portfolio Data',
  //   icon: <BugReportIcon />,
  // },
];

const AUTHENTICATION = {
  signIn,
  signOut,
};

const BRANDING: Branding = {
  logo: (
    <Image
      src="/icon.png"
      alt="Portfolio Manager Logo"
      width={32}
      height={32}
      style={{ borderRadius: '4px' }}
    />
  ),
  title: 'STARVEST',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return (
    <html lang="en" data-toolpad-color-scheme="light">
      <body>
        <SessionProvider session={session}>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <GlobalPortfolioProvider>
              <NextAppProvider
                theme={theme}
                navigation={NAVIGATION}
                branding={BRANDING}
                session={session}
                authentication={AUTHENTICATION}
              >
                {children}
              </NextAppProvider>
            </GlobalPortfolioProvider>
          </AppRouterCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
