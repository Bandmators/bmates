'use client';

import styled from '@emotion/styled';
import { Button } from 'bmates-ui';
import { Post } from 'contentlayer/generated';

import { maxMedia } from '@/libs/media';

import Toc from './Toc';

export default function Helper({ post }: { post: Post }) {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyUrl = () => {
    const currentUrl = window.location.href;

    navigator.clipboard.writeText(currentUrl).then(
      () => {
        // setCopySuccess('주소가 성공적으로 복사되었습니다.');
      },
      err => {
        console.error('주소 복사 실패:', err);
        // setCopySuccess('주소 복사 실패');
      },
    );
  };

  return (
    <HelperStyled>
      <HelperBar>
        <Toc post={post} />
      </HelperBar>

      <HelperFooter>
        <HelpButton onClick={handleCopyUrl} size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon icon-tabler icons-tabler-outline icon-tabler-unlink"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M17 22v-2" />
            <path d="M9 15l6 -6" />
            <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />
            <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />
            <path d="M20 17h2" />
            <path d="M2 7h2" />
            <path d="M7 2v2" />
          </svg>
        </HelpButton>
        <HelpButton onClick={handleScrollToTop} size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-up-circle"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 17v-14" />
            <path d="M15 6l-3 -3l-3 3" />
            <path d="M12 17a2 2 0 1 0 0 4a2 2 0 0 0 0 -4" />
          </svg>
        </HelpButton>
      </HelperFooter>
    </HelperStyled>
  );
}

const HelperStyled = styled.div`
  position: sticky;
  display: block;
  top: calc(var(--layoutHeader) + 2rem);
  padding-top: 2rem;
  ${maxMedia.desktopLarge} {
    display: none;
  }
`;

const HelperBar = styled.div`
  padding-left: 1.5rem;
  margin-top: 0px;
  margin-bottom: 5px;
  /* border-radius: 0.5rem; */
  border-left: 1px solid var(--hr);
  background-color: var(--white);
  transition: background var(--delay);
  -moz-transition: background var(--delay);
  -webkit-transition: background var(--delay);
  -ms-transition: background var(--delay);
  -o-transition: background var(--delay);
`;

const HelperFooter = styled.div`
  position: absolute;
  display: flex;
  /* bottom: -2rem; */
  width: 100%;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const HelpButton = styled(Button)`
  padding: 0.375rem;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--gray-100);
  border: none;
`;
