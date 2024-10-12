import { Layout } from '@/components/layout';
import { allPosts } from '@/constants/posts';

export default function Home() {
  return <Layout>{JSON.stringify(allPosts)}</Layout>;
}
