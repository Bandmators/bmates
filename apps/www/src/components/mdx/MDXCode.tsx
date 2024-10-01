'use client';

import styled from '@emotion/styled';
import { useToast } from 'bmates-ui';
import { useRef } from 'react';

export default function MDXCode({ children, className }: React.ComponentProps<'pre'>) {
  const ref = useRef<HTMLPreElement>(null);
  const { toast } = useToast();

  const handleCopy = () => {
    const code = ref.current?.querySelector('code')?.innerText;
    if (!code) return;

    navigator.clipboard.writeText(code).then(() => {
      toast({
        title: 'Copy Code !',
        variant: 'primary',
        time: 3000,
      });
    });
  };

  return (
    <CodeBlock>
      <pre ref={ref} className={className}>
        {children}
      </pre>
      <CopyButton className="btn-copy" aria-label="copy-button" onClick={handleCopy}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon icon-tabler icons-tabler-outline icon-tabler-copy"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
          <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
        </svg>
      </CopyButton>
    </CodeBlock>
  );
}

const CodeBlock = styled.div`
  border-radius: 0.5rem;
  margin: 1.5rem 0rem;
  overflow: hidden;
  position: relative;
  pre {
    margin: 0px;
  }
  .rehype-code-title + & {
    margin-top: 0rem;
    border-radius: 0rem 0rem 0.5rem 0.5rem;
  }
  &:hover {
    .btn-copy {
      display: flex;
    }
  }
`;
const CopyButton = styled.button`
  display: none;
  position: absolute;
  cursor: pointer;
  top: 0.5rem;
  right: 0.5rem;
  border: none;
  border-radius: 0.25rem;
  color: var(--black);
  background-color: var(--white);
  opacity: 1;
  padding: 0.25rem;
  &:hover {
    opacity: 0.7;
  }
`;
