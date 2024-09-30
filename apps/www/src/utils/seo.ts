import { Metadata } from 'next';

import { PostType } from '@/types/post';

export const siteConfig = {
  url: 'https://kyechan99.github.io',
  title: 'kyechan99',
  description: 'kyechan99',
  copyright: 'kyechan99 © All rights reserved.',
  since: 2023,
  googleAnalyticsId: '',
  author: 'kyechan99',
  email: 'kyechan99@gmail.com',
  profile: 'https://kyechan99.github.io/profile.png',
};

const getRelativeUrl = (url?: string) => {
  if (!url) return siteConfig.url;

  return `${siteConfig.url}/${url.replace(/^\/+/g, '')}`;
};

export const getBaseMetadata = ({ title, path }: { title: string; path?: string }): Metadata => {
  const url = getRelativeUrl(path);
  const { description } = siteConfig;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: siteConfig.title,
      url,
      type: 'website',
      images: [
        {
          url: siteConfig.profile,
          alt: title,
        },
      ],
    },
    alternates: {
      canonical: url,
    },
  };
};

export const getArticleMetadata = (post: PostType): Metadata => {
  const description = 'Web Audio Editor Oepnsource';
  const url = getRelativeUrl(post.url);

  return {
    title: post.title,
    description,
    keywords: ['bmates'],
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      siteName: siteConfig.title,
      url,
      authors: [`https://github.com/kyechan99`],
      images: [
        // {
        //   url: `${siteConfig.url}${headerImgPath(post.headerImg)}`,
        //   alt: post.title,
        // },
      ],
    },
    alternates: {
      canonical: url,
    },
  };
};

export const JSONLD = (post: PostType) => {
  const description = 'Web Audio Editor Oepnsource';
  const jsonLD = {
    '@context': 'https://schema.org',
    '@type': 'DocumentationPage',
    name: siteConfig.author,
    author: {
      '@type': 'Person',
      name: siteConfig.author,
      email: siteConfig.email,
      url: siteConfig.url,
    },
    image: siteConfig.profile,
    description,
    title: post.title,
    headline: post.title,
    inLanguage: 'ko',
    mainEntityOfPage: { '@type': 'WebPage', '@id': getRelativeUrl(post.url) },
  };
  return JSON.stringify(jsonLD);
};
