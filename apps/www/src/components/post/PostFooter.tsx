'use client';

import styled from '@emotion/styled';
import Link from 'next/link';

import { allPosts } from '@/constants/posts';
import { maxMedia } from '@/libs/media';
import { PostType } from '@/types/post';

export default function PostFooter({ post }: { post: PostType }) {
  const postIndex = allPosts.findIndex(v => v.path === post.path);

  // const prevPost = posts.at(postIndex + 1) ?? null;
  // const nextPost = posts.at(postIndex - 1) ?? null;
  const prevPost = postIndex > 0 ? allPosts.at(postIndex - 1) : null;
  const nextPost = postIndex < allPosts.length - 1 ? allPosts.at(postIndex + 1) : null;

  return (
    <PostFooterStyled>
      {prevPost && (
        <RelatedPost href={prevPost.url} style={{ alignItems: 'flex-start' }}>
          <span className="direction">PREV</span>
          <span className="related">{prevPost.title}</span>
        </RelatedPost>
      )}
      {nextPost && (
        <RelatedPost href={nextPost.url} style={{ marginLeft: 'auto', alignItems: 'flex-end' }}>
          <span className="direction">NEXT</span>
          <span className="related">{nextPost.title}</span>
        </RelatedPost>
      )}
    </PostFooterStyled>
  );
}

const PostFooterStyled = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5rem;
  margin-bottom: 5rem;
  gap: 2rem;
`;

const RelatedPost = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  max-width: 25rem;
  flex-direction: column;
  background: var(--gray-100);
  .direction {
    font-size: 0.75rem;
    color: var(--gray-400);
    font-weight: 400;
  }
  .related {
    color: var(--black);
    font-size: 1.25rem;
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  &:hover {
    background: var(--gray-200);
  }
  ${maxMedia.mobile} {
    padding: 0.5rem;
  }
`;
