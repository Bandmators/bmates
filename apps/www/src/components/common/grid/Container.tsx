'use client';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { maxMedia, minMedia } from '@/libs/media';

export const PostBody = styled.div`
  display: flex;
  ${maxMedia.tablet} {
    flex-direction: column;
  }
`;

export const PostSidebarContainer = styled.div`
  width: var(--sidebarWidth);
  border-right: 1px solid var(--gray-200);
  ${maxMedia.tablet} {
    width: 100%;
  }
`;

export const PostSidebar = styled.aside`
  position: sticky;
  top: var(--layoutHeader);
  padding: 2rem;
  overflow-y: auto;
  height: calc(100vh - var(--layoutHeader));
  ${maxMedia.mobile} {
    padding: 1rem;
  }
`;
export const PostSidebarItemList = styled.ul`
  margin: 0px;
  padding-left: 0px;
  list-style: none;
`;

export const PostSidebarTitle = styled.div`
  margin: 0.25rem 0rem;
  padding: 8px 8px;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  button:hover {
    background-color: var(--gray-100);
  }
`;

export const PostSidebarItem = styled.li`
  margin: 0.125rem 0rem;
  a {
    color: var(--black);
    font-weight: 500;
    font-size: 14px;
    width: 100%;
    display: block;
    padding: 10px 8px;
    border-radius: 8px;
  }
  a:hover {
    background: var(--gray-100);
  }
  a.active {
    color: var(--white);
    background: var(--gray-900);
  }
  &.section {
    margin-bottom: 1rem;
  }
`;

export const PostContent = styled.div`
  display: flex;
  margin: 0 auto;
  position: relative;
  width: calc(100% - var(--sidebarWidth));
  justify-content: center;
  ${maxMedia.tablet} {
    width: 100%;
  }
`;

export const PostAritcle = styled.article`
  width: 100%;
  margin: 1rem 0rem;
  padding: 0rem 1rem;
  max-width: 700px;
  ${minMedia.desktopLarge} {
    width: calc(100% - var(--sidebarWidth));
    margin: 2rem 0rem;
    padding: 0rem 2rem;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  h7 {
    scroll-margin-top: var(--layoutHeader);
  }
`;

export const PostHelper = styled.div`
  ${minMedia.desktopLarge} {
    width: var(--sidebarWidth);
  }
`;

export const Container = styled.div`
  width: 100%;
  margin-left: auto;
  margin-right: auto;

  ${minMedia.tablet} {
    max-width: 736px;
  }
  ${minMedia.desktop} {
    max-width: 1120px;
    padding-left: 2rem;
    padding-right: 2rem;
  }
  /* ${minMedia.desktopLarge} {
    max-width: 1168px;
  } */
`;

export const ContainerCollapse = styled(Container)`
  display: flex;
  justify-content: space-between;
`;

export const Row = styled.div<{ $direction?: 'column' | 'row'; $gap?: string }>`
  display: flex;
  ${props =>
    props.$direction &&
    css`
      flex-direction: ${props.$direction};
    `}
  ${props =>
    props.$gap &&
    css`
      gap: ${props.$gap};
    `}
`;

export const Col = styled.div<{ width: string }>`
  flex: 0 0 ${props => props.width};
  /* max-width: ${props => props.width}; */
  ${minMedia.desktop} {
    max-width: ${props => props.width};
  }
`;
export const ColMain = styled.div`
  max-width: 75%;
  ${maxMedia.desktop} {
    max-width: 100%;
  }
`;
export const ColSub = styled.div`
  margin-left: auto;
  flex: 0 0 calc(25% - 2rem);
  max-width: calc(25% - 2rem);
  ${maxMedia.desktop} {
    display: none;
  }
`;
