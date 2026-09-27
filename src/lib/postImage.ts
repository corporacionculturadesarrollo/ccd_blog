import type { CollectionEntry } from 'astro:content';

const htmlImagePattern = /<img\b[^>]*\bsrc=["']([^"']+)["']/i;
const markdownImagePattern = /!\[[^\]]*\]\(\s*<?([^)>\s]+)>?(?:\s+["'][^"']*["'])?\s*\)/i;
const videoSrcPattern = /<video\b[^>]*\bsrc=["']([^"']+)["']/i;
const videoPosterPattern = /<video\b[^>]*\bposter=["']([^"']+)["']/i;

/** Imagen de respaldo para posts sin medio propio (todas las tarjetas deben mostrar medios). */
export const DEFAULT_POST_IMAGE = '/images/banner.webp';

export type PostVideo = { src: string; poster?: string };

/** Extrae el <video> del body del post, si existe. */
export function getPostVideo(post: CollectionEntry<'blog'>): PostVideo | undefined {
  const body = post.body || '';
  const src = body.match(videoSrcPattern)?.[1];
  if (!src) return undefined;
  const poster = body.match(videoPosterPattern)?.[1];
  return poster ? { src, poster } : { src };
}

export function getPostImage(post: CollectionEntry<'blog'>): string | undefined {
  const body = post.body || '';
  const bodyImage = body.match(htmlImagePattern)?.[1] || body.match(markdownImagePattern)?.[1];

  // imagen del body → image del frontmatter → póster del video → respaldo institucional
  return bodyImage || post.data.image || body.match(videoPosterPattern)?.[1] || DEFAULT_POST_IMAGE;
}
