'use client';

import { wrappedGroupsState } from '@/recoil/sidebar';
import { Button } from 'bmates-ui';
import clsx from 'clsx';
import Link from 'next/link';
import { useRecoilState } from 'recoil';

import {
  PostSidebar,
  PostSidebarContainer,
  PostSidebarItem,
  PostSidebarItemList,
  PostSidebarTitle,
} from '@/components/common/grid/Container';
import { allPostTree } from '@/constants/posts';
import { PostType } from '@/types/post';

export const Sidebar = ({ post }: { post: PostType }) => {
  const [wrappedGroups, setWrappedGroups] = useRecoilState(wrappedGroupsState);

  const toggleWrap = (group: string) => {
    setWrappedGroups(prev => {
      const newState = { ...prev, [group]: !prev[group] };
      return newState;
    });
  };

  return (
    <PostSidebarContainer>
      <PostSidebar>
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
                      <Link href={p.url} className={clsx({ active: p._raw.flattenedPath === post._raw.flattenedPath })}>
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
