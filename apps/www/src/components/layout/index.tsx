import { PostAritcle, PostBody, PostContent, PostHelper } from '@/components/common/grid/Container';
import Helper from '@/components/helper';
import Footer from '@/components/layout/Footer';
import Header, { HeaderContainer } from '@/components/layout/Header';
import Mdx from '@/components/mdx';
import PostFooter from '@/components/post/PostFooter';
import { PostType } from '@/types/post';
import { JSONLD } from '@/utils/seo';

import { Sidebar } from './Sidebar';

export const Layout = (props: React.PropsWithChildren) => {
  return (
    <>
      <HeaderContainer />
      <Sidebar post={undefined} />
      {props.children}
      <Footer />
    </>
  );
};

export const PostLayout = ({ post, props }: { post: PostType; props?: React.PropsWithChildren }) => {
  return (
    <div id="docs">
      <Header />
      <PostBody>
        <Sidebar post={post} />
        <PostContent>
          <PostAritcle>
            <h1>{post.title}</h1>
            <Mdx code={post.body.code} />
            {props?.children}
            <PostFooter post={post} />
            <Footer />
          </PostAritcle>
          <PostHelper>
            <Helper post={post} />
          </PostHelper>
        </PostContent>
      </PostBody>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSONLD(post) }} />
    </div>
  );
};
