'use client';

import styled from '@emotion/styled';
import clsx from 'clsx';
import { Post } from 'contentlayer/generated';
import Link from 'next/link';

import useTocHighlight from '@/hooks/useTocHighlight';
import { Heading } from '@/types/heading';

export default function Toc({ post }: { post: Post }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [highlight, setHighlight] = useTocHighlight(post.headings.length > 0 ? post.headings[0].slug : '');

  return (
    <TocList>
      {post.headings.map((heading: Heading) => (
        <TocItem key={heading.slug} heading={heading} highlight={highlight === heading.slug} />
      ))}
    </TocList>
  );
}

const TocItem = ({ heading, highlight }: { heading: Heading; highlight: boolean }) => {
  return (
    <TocItemStyled data-level={heading.level}>
      <Link href={`#${heading.slug}`} className={clsx({ highlight })}>
        {heading.content}
      </Link>
    </TocItemStyled>
  );
};

const TocList = styled.ul`
  margin: 0px;
  padding-left: 0px;
  list-style: none;
`;

const TocItemStyled = styled.li`
  margin: 0.5rem 0rem;
  font-size: 14px;
  &[data-level='2'] {
    padding-left: 0rem;
  }
  &[data-level='3'] {
    padding-left: 1.5rem;
  }
  &[data-level='4'] {
    padding-left: 3rem;
  }
  a {
    color: var(--black);
    font-weight: 300;
  }
  a.highlight {
    font-weight: 500;
    color: var(--primary);
  }
`;
