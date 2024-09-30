'use client';

import styled from '@emotion/styled';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { maxMedia } from '@/libs/media';

export const NavLogo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--black);
  font-size: 1.25rem;
  font-weight: 700;
`;

export const Nav = styled.ul`
  display: flex;
  align-items: center;
  padding-left: 0;
  margin-top: 0;
  margin-bottom: 0;
  list-style: none;
`;

export const NavCollapse = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  ${maxMedia.mobile} {
    gap: 0.25rem;
  }
`;

interface NavLinkProps extends React.ComponentProps<'a'> {
  href: string;
  active?: boolean;
}

export const NavLink = ({ href, ...props }: NavLinkProps) => {
  const pathname = usePathname();
  const pathnameList = pathname.split('/');
  const firstPathname = pathnameList.length > 0 && pathnameList[1].toLowerCase();
  const hrefPath = href.split('/')[1].toLowerCase();

  return (
    <NavLinkStyled href={href} className={clsx({ active: hrefPath.toLowerCase() === firstPathname })}>
      {props.children}
    </NavLinkStyled>
  );
};

const NavLinkStyled = styled(Link)`
  color: var(--black);
  padding: 0.25rem 1rem;
  border-radius: 0.5rem;
  opacity: 0.7;
  font-weight: 400;
  font-size: 1rem;
  &:not(.active):hover {
    opacity: 1;
  }
  &.active {
    opacity: 1;
    position: relative;
  }
  ${maxMedia.mobile} {
    font-size: 14px;
    padding: 0.5rem 0.5rem;
  }
`;

export const NavItem = styled.li``;

export const NavBrand = styled(Link)`
  /* margin-right: 1rem; */
  display: flex;
  align-items: center;
  color: var(--black);
  /* background-color: ${({ theme }) => theme.colors.white}; */
  border-radius: 0.25rem;
  padding: 0.125rem;
  ${maxMedia.mobile} {
    padding: 0rem;
    margin-right: 0.5rem;
  }
  &:hover {
    background-color: var(--grey);
  }
`;
