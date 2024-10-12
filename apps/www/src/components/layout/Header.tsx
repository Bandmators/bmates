'use client';

import { openSidebarState } from '@/recoil/sidebar';
import styled from '@emotion/styled';
import { Button, Select, SelectContent, SelectItem, SelectToggle, minMedia } from 'bmates-ui';
import Image from 'next/image';
import { useSetRecoilState } from 'recoil';

import { Nav, NavCollapse, NavDivider, NavItem, NavLink, NavLogo } from '@/components/common/nav/Nav';
import { Navbar } from '@/components/common/nav/Navbar';

import { ContainerCollapse } from '../common/grid/Container';

const NavWrapped = () => {
  const setShowSidebar = useSetRecoilState(openSidebarState);

  return (
    <>
      <NavLogo href="/">
        <Image src="https://avatars.githubusercontent.com/u/157222787?s=50" alt="logo" width={32} height={32} />
        BMates
      </NavLogo>
      <NavMenu />
      <NavMenuOpenButton size="icon" onClick={() => setShowSidebar(true)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4 6l16 0" />
          <path d="M4 12l16 0" />
          <path d="M4 18l16 0" />
        </svg>
      </NavMenuOpenButton>
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

export const NavMenu = () => {
  return (
    <NavCollapse className="nav-menu">
      <Nav>
        <NavItem>
          <NavLink href="/docs/getting-started">Docs</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="/#demo">Demo</NavLink>
        </NavItem>
        <NavDivider />
        <NavItem>
          <Select align="end">
            <SelectToggleStyled>v0.0.4</SelectToggleStyled>
            <SelectContent>
              <SelectItemStyled value={'v0.0.4'}>v0.0.4</SelectItemStyled>
            </SelectContent>
          </Select>
        </NavItem>
        <NavDivider />
        <NavItem>
          <NavLink href="https://github.com/Bandmators/bmates" target="__blank">
            <svg version="1.1" height="24" width="24" viewBox="0 0 24 24" aria-hidden="true" data-view-component="true">
              <path d="M12.5.75C6.146.75 1 5.896 1 12.25c0 5.089 3.292 9.387 7.863 10.91.575.101.79-.244.79-.546 0-.273-.014-1.178-.014-2.142-2.889.532-3.636-.704-3.866-1.35-.13-.331-.69-1.352-1.18-1.625-.402-.216-.977-.748-.014-.762.906-.014 1.553.834 1.769 1.179 1.035 1.74 2.688 1.25 3.349.948.1-.747.402-1.25.733-1.538-2.559-.287-5.232-1.279-5.232-5.678 0-1.25.445-2.285 1.178-3.09-.115-.288-.517-1.467.115-3.048 0 0 .963-.302 3.163 1.179.92-.259 1.897-.388 2.875-.388.977 0 1.955.13 2.875.388 2.2-1.495 3.162-1.179 3.162-1.179.633 1.581.23 2.76.115 3.048.733.805 1.179 1.825 1.179 3.09 0 4.413-2.688 5.39-5.247 5.678.417.36.776 1.05.776 2.128 0 1.538-.014 2.774-.014 3.162 0 .302.216.662.79.547C20.709 21.637 24 17.324 24 12.25 24 5.896 18.854.75 12.5.75Z"></path>
            </svg>
          </NavLink>
        </NavItem>
      </Nav>
    </NavCollapse>
  );
};

export const HeaderContainer = () => {
  return (
    <Navbar>
      <ContainerCollapse>
        <NavWrapped />
      </ContainerCollapse>
    </Navbar>
  );
};

const SelectToggleStyled = styled(SelectToggle)`
  background: transparent;
  border: none;
`;
const SelectItemStyled = styled(SelectItem)`
  margin-bottom: 0px;
`;

const NavMenuOpenButton = styled(Button)`
  ${minMedia.mobile} {
    display: none;
  }
`;
