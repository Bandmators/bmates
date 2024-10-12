import type { Metadata } from 'next';
import { Barlow } from 'next/font/google';

import Provider from '@/components/layout/Provider';
import { getBaseMetadata } from '@/utils/seo';

const notoSansKr = Barlow({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--Barlow',
});

export const metadata: Metadata = getBaseMetadata({ title: 'BMates' });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html data-theme="" lang="kr" suppressHydrationWarning={true}>
      <head>
        <meta name="google-site-verification" content="CPBHSXOcqx3RLJ-Pn1Vr34l30UqV46HXj7Et7LsCM7U" />
        <link rel="icon" href="/bmates/favicon.ico" sizes="any" />
      </head>
      <body className={notoSansKr.className}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
