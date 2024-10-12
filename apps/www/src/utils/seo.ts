import { Metadata } from 'next';

import { PostType } from '@/types/post';

export const siteConfig = {
  url: 'https://Bandmators.github.io',
  title: 'BMates',
  description: 'Web Audio Editor',
  copyright: 'kyechan99 © All rights reserved.',
  since: 2024,
  googleAnalyticsId: '',
  author: 'kyechan99',
  email: 'kyechan99@gmail.com',
  profile: 'https://raw.githubusercontent.com/Bandmators/bmates/refs/heads/main/apps/www/public/bmates_thumbnail.png',
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
    metadataBase: new URL('https://bandmators.github.io'),
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
    twitter: {
      card: 'summary_large_image',
      site: '@kyechan99',
      title,
      description,
      images: [
        {
          url: siteConfig.profile,
          alt: title,
        },
      ],
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
    metadataBase: new URL('https://bandmators.github.io'),
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      siteName: siteConfig.title,
      url,
      authors: [`https://github.com/kyechan99`],
      images: [
        {
          url: siteConfig.profile,
          alt: post.title,
        },
      ],
    },
    alternates: {
      canonical: url,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@kyechan99',
      title: post.title,
      description,
      images: [
        {
          url: siteConfig.profile,
          alt: post.title,
        },
      ],
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
