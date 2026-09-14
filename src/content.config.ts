import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: () => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    image: z.string().optional(),
    author: z.string(),
    authorSlug: z.string().optional(),
    authorImage: z.string().default('/images/author-default.svg'),
    authorBio: z.string().optional(),
    featured: z.boolean().default(false),
    category: z.array(z.string()),
    tags: z.array(z.string()).default([]),
  }),
});

const autores = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/autores' }),
  schema: z.object({
    name: z.string(),
    slug: z.string().optional(),
    image: z.string().default('/images/author-default.svg'),
  }),
});

export const collections = { blog, autores };
