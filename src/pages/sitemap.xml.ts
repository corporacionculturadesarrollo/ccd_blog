import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL('https://blog.culturaydesarrollo.org');
  const posts = await getCollection('blog');
  const typedPosts = posts as Array<{ data: { category: string[]; tags: string[]; pubDate: Date; } }>; 
  const categories = [...new Set(typedPosts.flatMap((post) => post.data.category))] as string[];
  const tags = [...new Set(typedPosts.flatMap((post) => post.data.tags))] as string[];
  const paths = [
    '',
    '/acerca/',
    ...posts.map((post: (typeof posts)[number]) => `/${post.id}/`),
    '/categorias/',
    '/tags/',
    '/autores/',
    '/archivo/',
    ...posts.flatMap((post: (typeof posts)[number]) => [
      `/archivo/${post.data.pubDate.getFullYear()}/`,
      `/archivo/${post.data.pubDate.getFullYear()}/${String(post.data.pubDate.getMonth() + 1).padStart(2, '0')}/`,
    ]),
    ...categories.map((category: string) => `/categorias/${category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}/`),
    ...tags.map((tag: string) => `/tags/${tag.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}/`),
  ];
  const urls = [...new Set(paths)]
    .map((path) => new URL(path, baseUrl).href)
    .map((url) => `  <url><loc>${url}</loc></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    },
  );
};
