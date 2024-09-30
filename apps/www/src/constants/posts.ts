import { allPosts as allCLPosts } from 'contentlayer/generated';

import { PostType } from '@/types/post';

export const allPosts: PostType[] = allCLPosts.sort((a, b) => a.order - b.order);
