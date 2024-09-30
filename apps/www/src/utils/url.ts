export const isExternalLink = (url: string) => {
  return url.startsWith('http') || url.startsWith('//');
};
