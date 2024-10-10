'use client';

import styled from '@emotion/styled';
import { Toaster, maxMedia } from 'bmates-ui';
import Image from 'next/image';
import Link from 'next/link';

import { Container } from '../common/grid/Container';

export default function Footer() {
  return (
    <FooterStyle>
      <FooterNavBar>
        <FooterTitle>
          <Link href="/" className="name">
            <Image src="https://avatars.githubusercontent.com/u/157222787?s=50" alt="logo" width={32} height={32} />
            BMates
          </Link>
          <div className="copyright">© 2024 BMates</div>
        </FooterTitle>
        <FooterItemlist>
          <FooterItemListTitle>Docs</FooterItemListTitle>
          <li>
            <Link href="/docs/getting-started">Getting Started</Link>
          </li>
          <li>
            <Link href="/docs/configuration">Configuration</Link>
          </li>
        </FooterItemlist>
        <FooterItemlist>
          <FooterItemListTitle>BMates</FooterItemListTitle>
          <li>
            <Link href="/">FAQ</Link>
          </li>
          <li>
            <Link href="/">Sponsors</Link>
          </li>
          <li>
            <Link href="/">ChangeLog</Link>
          </li>
          <li>
            <Link href="/">Releases</Link>
          </li>
        </FooterItemlist>
      </FooterNavBar>
      <Toaster position="bottom-right" />
    </FooterStyle>
  );
}
const FooterStyle = styled.footer`
  margin-top: 8rem;
  border-top: 1px solid var(--hr);
`;
const FooterNavBar = styled(Container)`
  padding: 3rem 0rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  ${maxMedia.tablet} {
    padding: 3rem 1rem;
  }
  ${maxMedia.mobile} {
    gap: 2rem;
    padding: 3rem 1rem;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const FooterTitle = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  .name {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: bold;
  }
  .copyright {
    color: var(--gray-500);
  }
`;
const FooterItemListTitle = styled.div`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const FooterItemlist = styled.ul`
  display: flex;
  flex-direction: column;
  list-style-type: none;
  padding: 0px;
  margin: 0px;
  a {
    color: var(--gray-600);
    font-size: 16px;
    font-weight: 400;
  }
`;
