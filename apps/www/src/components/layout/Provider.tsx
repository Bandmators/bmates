'use client';

import GlobalStyle from '@/styles/GlobalStyle';
import baseTheme from '@/styles/theme';
import { Global, ThemeProvider } from '@emotion/react';
import { BMatesProvider } from 'bmates-ui';
import { useEffect } from 'react';
import { RecoilRoot } from 'recoil';

export default function Provider(props: React.PropsWithChildren) {
  useEffect(() => {
    document.body.style.transition = 'background var(--delay)';
  }, []);

  return (
    <BMatesProvider>
      <ThemeProvider theme={baseTheme}>
        <Global styles={GlobalStyle(baseTheme)} />
        <RecoilRoot>{props.children}</RecoilRoot>
      </ThemeProvider>
    </BMatesProvider>
  );
}
