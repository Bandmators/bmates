import clsx from 'clsx';
import Link from 'next/link';

import {
  PostSidebar,
  PostSidebarContainer,
  PostSidebarItem,
  PostSidebarItemList,
} from '@/components/common/grid/Container';
import { allPosts } from '@/constants/posts';
import { PostType } from '@/types/post';

export const Sidebar = ({ post }: { post: PostType }) => {
  return (
    <PostSidebarContainer>
      <PostSidebar>
        <PostSidebarItemList>
          {allPosts.map(p => (
            <PostSidebarItem key={p._id}>
              <Link href={p.url} className={clsx({ active: p._raw.flattenedPath === post._raw.flattenedPath })}>
                {p.title}
              </Link>
            </PostSidebarItem>
          ))}
        </PostSidebarItemList>
      </PostSidebar>
    </PostSidebarContainer>
  );
};
