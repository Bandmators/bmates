'use client';

import styled from '@emotion/styled';
import { maxMedia } from 'bmates-ui';
import Link from 'next/link';

import { isExternalLink } from '@/utils/url';

export default function MDXLink({ href, children, className }: React.ComponentProps<'a'>) {
  if (isExternalLink(href as string)) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <LinkStyled
      href={href as string}
      className={className}
      tabIndex={className?.split(' ').includes('anchor') ? -1 : 0}
    >
      {children}
    </LinkStyled>
  );
}

const LinkStyled = styled(Link)`
  position: relative;
  ${maxMedia.mobile} {
    display: none;
  }
  &.anchor {
    &::after {
      content: url('data:image/svg+xml;utf8,<svg fill="FFF" height="16px" width="16px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 490 490" xml:space="preserve"><path d="M64.333,490h58.401l33.878-137.69h122.259L245.39,490h58.401l33.878-137.69h119.92v-48.162h-108.24l29.2-117.324h79.04 v-48.162H390.23L424.108,0H365.31l-33.878,138.661H208.79L242.668,0h-58.415l-33.864,138.661H32.411v48.162h106.298l-28.818,117.324 h-77.48v48.162h65.8L64.333,490z M197.11,186.824h122.642l-29.2,117.324H168.292L197.11,186.824z"/></svg>');
      position: absolute;
      bottom: 0rem;
      right: 0.5rem;
      border-radius: 0.25rem;
      opacity: 0;
      font-weight: 300;
      transition-duration: var(--delay);
      padding: 0.25rem 0.25rem;
      font-size: 0.75rem;
      background: tomato;
      background-color: ${({ theme }) => theme.colors.white};
    }
    &:hover,
    *:hover > & {
      &::after {
        opacity: 1;
      }
    }
  }
`;
