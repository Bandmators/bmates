import Image from 'next/image';

import { Nav, NavCollapse, NavItem, NavLink, NavLogo } from '@/components/common/nav/Nav';
import { Navbar } from '@/components/common/nav/Navbar';

import { ContainerCollapse } from '../common/grid/Container';

const NavWrapped = () => {
  return (
    <>
      <NavLogo href="/">
        <Image src="https://avatars.githubusercontent.com/u/157222787?s=50" alt="logo" width={32} height={32} />
        BMates
      </NavLogo>
      <NavCollapse style={{ marginTop: '3px' }}>
        <Nav>
          <NavItem>
            <NavLink href="/docs/getting-started">Docs</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="/project">GitHub</NavLink>
          </NavItem>
        </Nav>
      </NavCollapse>
    </>
  );
};

export default function Header() {
  return (
    <Navbar>
      <NavWrapped />
    </Navbar>
  );
}

export const HeaderContainer = () => {
  return (
    <Navbar>
      <ContainerCollapse>
        <NavWrapped />
      </ContainerCollapse>
    </Navbar>
  );
};
