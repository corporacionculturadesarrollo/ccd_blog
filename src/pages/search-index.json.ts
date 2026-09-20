import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');
  const items = posts
    .sort((a: (typeof posts)[number], b: (typeof posts)[number]) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((post: (typeof posts)[number]) => ({
      id: post.id,
      title: post.data.title,
      description: post.data.description,
      author: post.data.author,
      category: post.data.category,
      tags: post.data.tags,
      date: post.data.pubDate.toISOString(),
      url: `/${post.id}/`,
      text: `${post.data.title} ${post.data.description} ${post.data.author} ${post.data.category.join(' ')} ${post.data.tags.join(' ')} ${post.body ?? ''}`
        .replace(/\s+/g, ' ')
        .trim(),
    }));

  return new Response(JSON.stringify({ version: 1, items }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
