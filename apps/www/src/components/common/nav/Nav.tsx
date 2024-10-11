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
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--gray-300);
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

export const NavGithub = styled.span`
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'/%3E%3C/svg%3E")
    no-repeat;
  mask-size: 100% 100%;
  background-color: currentColor;
  color: inherit;
`;

const NavLinkStyled = styled(Link)`
  color: var(--black);
  padding: 0.25rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 0px;
  opacity: 0.7;
  font-weight: 400;
  font-size: 1rem;

  display: flex;
  align-items: center;
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

export const NavItem = styled.li`
  margin-bottom: 0px;
  ${maxMedia.mobile} {
    button {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
  }
`;

export const NavDivider = styled.div`
  height: 1.25rem;
  margin: 0px 0.5rem;
  border-right: 1px solid var(--gray-300);
  ${maxMedia.mobile} {
    margin: 0px 0.5rem;
  }
`;

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
