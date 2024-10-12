import '@/styles/prism.css';

// import { notFound } from 'next/navigation';
// import { PostLayout } from '@/components/layout';
import { allPosts } from '@/constants/posts';
import { PostType } from '@/types/post';
import { getArticleMetadata } from '@/utils/seo';

export const generateStaticParams = async () => allPosts.map(post => ({ slug: post.path?.split('/') }));

export const generateMetadata = ({ params }: { params: { slug: string[] } }) => {
  const flattenedPath = params.slug.join('/');
  const post: PostType | undefined = allPosts.find(post => post.path === flattenedPath);

  if (!post) return {};
  return getArticleMetadata(post);
};

const PostPage = ({ params }: { params: { slug: string[] } }) => {
  const flattenedPath = params.slug.join('/');
  console.log(flattenedPath);
  const post = allPosts.find(post => post._raw.flattenedPath === flattenedPath);
  return (
    <div>
      {flattenedPath}
      <hr />
      {JSON.stringify(post)}
    </div>
  );
  // if (!post) notFound();

  // return <PostLayout post={post} />;
};

export default PostPage;
