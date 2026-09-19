import type { CollectionEntry } from 'astro:content';

const htmlImagePattern = /<img\b[^>]*\bsrc=["']([^"']+)["']/i;
const markdownImagePattern = /!\[[^\]]*\]\(\s*<?([^)>\s]+)>?(?:\s+["'][^"']*["'])?\s*\)/i;

export function getPostImage(post: CollectionEntry<'blog'>): string | undefined {
  const body = post.body || '';
  const bodyImage = body.match(htmlImagePattern)?.[1] || body.match(markdownImagePattern)?.[1];

  return bodyImage || post.data.image;
}
