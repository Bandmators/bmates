/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import GithubSlugger from 'github-slugger';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeCodeTitles from 'rehype-code-titles';
import rehypeImgSize from 'rehype-img-size';
import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { searchTermOptimization } from './src/utils/format';

// <-- 직접 경로 지정

const rehypeImgSizeAny: any = rehypeImgSize;

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    lastUpdatedDate: { type: 'date', required: true },
    order: { type: 'number', required: true },
  },
  computedFields: {
    url: { type: 'string', resolve: (post: any) => `/${post._raw.flattenedPath}` },
    headings: {
      type: 'json',
      resolve: async (post: any) => {
        const regXHN = /\n(?<flag>#{2,6})\s+(?<content>.+)/g;
        const ghSlugger = new GithubSlugger();
        const headings = Array.from(post.body.raw.matchAll(regXHN)).map(({ groups }: any) => {
          const level = groups?.flag?.length || 0;
          const content = groups?.content || '';
          return {
            level,
            content,
            slug: content ? ghSlugger.slug(content) : '',
          };
        });
        return headings;
      },
    },
    path: { type: 'string', resolve: (doc: any) => doc._raw.flattenedPath.replace(/^(docs|project)\//, '') },
    postType: { type: 'string', resolve: (doc: any) => doc._raw.sourceFileDir.split('/')[0] },
    searchTxt: { type: 'string', resolve: (doc: any) => searchTermOptimization(doc.title) },
    // slug: {
    //   type: 'string',
    //   resolve: doc => doc._raw.flattenedPath,
    // },
  },
}));

export default makeSource({
  contentDirPath: 'posts',
  contentDirExclude: ['private'],
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      // rehypeCodeWrap,
      rehypeCodeTitles,
      rehypePrism as any,
      [rehypeImgSizeAny, { dir: 'public' }],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ['anchor'],
          },
        },
      ],
    ],
  },
});
