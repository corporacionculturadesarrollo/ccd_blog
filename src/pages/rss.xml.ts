import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const blog = (await getCollection('blog')).filter((entry: { data: { draft: boolean } }) => !entry.data.draft);
  const sortedPosts = [...blog].sort(
    (a, b) => new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf()
  );

  return rss({
    title: 'Blog de Cultura y Desarrollo',
    description: 'Espacio de difusión, análisis y gestión cultural comunitaria.',
    site: context.site ?? 'https://blog.culturaydesarrollo.org',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/${post.id}/`,
      author: post.data.author,
      categories: post.data.tags,
    })),
    stylesheet: '/rss/styles.xsl',
    customData: '<language>es-CO</language>',
  });
}
