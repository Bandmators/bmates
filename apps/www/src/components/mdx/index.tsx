import type { MDXComponents } from 'mdx/types';
import { useMDXComponent } from 'next-contentlayer/hooks';

import MDXCode from '@/components/mdx/MDXCode';
import MDXImage from '@/components/mdx/MDXImage';
import MDXLink from '@/components/mdx/MDXLink';

const mdxComponents: MDXComponents = {
  a: MDXLink,
  img: MDXImage,
  pre: MDXCode,
};

export default function Mdx({ code }: { code: string }) {
  const MDXComponent = useMDXComponent(code);

  return <MDXComponent components={mdxComponents} />;
}
