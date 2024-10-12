'use client';

import { openSidebarState, wrappedGroupsState } from '@/recoil/sidebar';
import { Button } from 'bmates-ui';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import {
  PostSidebar,
  PostSidebarCloseButtonMo,
  PostSidebarContainer,
  PostSidebarItem,
  PostSidebarItemList,
  PostSidebarTitle,
} from '@/components/common/grid/Container';
import { allPostTree } from '@/constants/posts';
import { PostType } from '@/types/post';

import { NavMenu } from './Header';

export const Sidebar = ({ post }: { post?: PostType }) => {
  const pathname = usePathname();
  const [wrappedGroups, setWrappedGroups] = useRecoilState(wrappedGroupsState);
  const [showSidebar, setShowSidebar] = useRecoilState(openSidebarState);

  useEffect(() => {
    setShowSidebar(false);
  }, [pathname]);

  const toggleWrap = (group: string) => {
    setWrappedGroups(prev => {
      const newState = { ...prev, [group]: !prev[group] };
      return newState;
    });
  };

  return (
    <PostSidebarContainer className={showSidebar ? 'show' : ''}>
      <PostSidebarCloseButtonMo
        variant="default"
        size="icon"
        onClick={() => {
          setShowSidebar(!showSidebar);
        }}
      >
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
          <path d="M18 6l-12 12" />
          <path d="M6 6l12 12" />
        </svg>
      </PostSidebarCloseButtonMo>
      <PostSidebar className={post === undefined ? 'hide' : ''}>
        {showSidebar && <NavMenu />}
        <PostSidebarItemList>
          {Object.entries(allPostTree).map(([group, posts]) => (
            <PostSidebarItem key={group} className="section">
              {group && (
                <PostSidebarTitle>
                  {group}
                  <Button size="icon" variant="ghost" onClick={() => toggleWrap(group)}>
                    {wrappedGroups[group] ? <WrapIcon /> : <UnWrapIcon />}
                  </Button>
                </PostSidebarTitle>
              )}
              {!wrappedGroups[group] && (
                <PostSidebarItemList>
                  {posts.map(p => (
                    <PostSidebarItem key={p._id}>
                      <Link
                        href={p.url}
                        className={clsx({ active: p._raw.flattenedPath === post?._raw.flattenedPath })}
                      >
                        {p.title}
                      </Link>
                    </PostSidebarItem>
                  ))}
                </PostSidebarItemList>
              )}
            </PostSidebarItem>
          ))}
        </PostSidebarItemList>
      </PostSidebar>
    </PostSidebarContainer>
  );
};

const WrapIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="0.875rem"
      height="0.875rem"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-up"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M6 15l6 -6l6 6" />
    </svg>
  );
};

const UnWrapIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="0.875rem"
      height="0.875rem"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M6 9l6 6l6 -6" />
    </svg>
  );
};
