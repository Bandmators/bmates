import { allPosts as allCLPosts } from 'contentlayer/generated';

import { PostType } from '@/types/post';

export const allPosts: PostType[] = allCLPosts.sort((a, b) => a.order - b.order);

// const createNestedArray = (posts: PostType[]) => {
//   const nestedPosts: { [key: string]: PostType[] } = {};

//   posts.forEach(post => {
//     const depth = post.url.split('/').length - 1;
//     if (!nestedPosts[depth]) {
//       nestedPosts[depth] = [];
//     }
//     nestedPosts[depth].push(post);
//   });

//   return Object.values(nestedPosts);
// };

const createGroupedArray = (posts: PostType[]) => {
  const groupedPosts: { [key: string]: PostType[] } = {};

  posts.forEach(post => {
    const group = post.group;
    if (!groupedPosts[group]) {
      groupedPosts[group] = [];
    }
    groupedPosts[group].push(post);
  });

  return groupedPosts;
};

export const allPostTree = createGroupedArray(allCLPosts.sort((a, b) => a.order - b.order));
