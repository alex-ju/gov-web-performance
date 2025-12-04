'use client';

import {
  Header as CarbonHeader,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
} from '@carbon/react';
import { Dashboard, ChartLine, Compare } from '@carbon/icons-react';
import Link from 'next/link';

const BASE_PATH = process.env.NODE_ENV === 'production' ? '/gov-web-performance' : '';

export default function Header() {
  return (
    <CarbonHeader aria-label="European Government Website Performance">
      <HeaderName href={`${BASE_PATH}/`} prefix="">
        <Dashboard size={20} style={{ marginRight: '0.5rem' }} />
        Gov Performance Dashboard
      </HeaderName>
      <HeaderNavigation aria-label="Main navigation">
        <HeaderMenuItem href={`${BASE_PATH}/`}>
          Dashboard
        </HeaderMenuItem>
        <HeaderMenuItem href={`${BASE_PATH}/rankings`}>
          Rankings
        </HeaderMenuItem>
        <HeaderMenuItem href={`${BASE_PATH}/compare`}>
          Compare
        </HeaderMenuItem>
      </HeaderNavigation>
      <HeaderGlobalBar>
        <HeaderGlobalAction
          aria-label="View on GitHub"
          onClick={() => window.open('https://github.com/alex-ju/gov-web-performance', '_blank')}
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </HeaderGlobalAction>
      </HeaderGlobalBar>
    </CarbonHeader>
  );
}
