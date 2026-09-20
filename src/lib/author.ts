import type { CollectionEntry } from 'astro:content';

type Author = CollectionEntry<'autores'>;

const normalize = (value: string | undefined) =>
  value?.trim().toLocaleLowerCase() || '';

export function resolveAuthor(
  authors: Author[],
  authorSlug: string | undefined,
  authorName: string,
): Author | undefined {
  const candidates = [authorSlug, authorName].map(normalize).filter(Boolean);

  return authors.find((author) => {
    const identifiers = [author.id, author.data.slug, author.data.name].map(normalize);
    return candidates.some((candidate) => identifiers.includes(candidate));
  });
}

export function postBelongsToAuthor(
  post: CollectionEntry<'blog'>,
  author: Author,
): boolean {
  const identifiers = [author.id, author.data.slug, author.data.name].map(normalize);
  return [post.data.authorSlug, post.data.author].map(normalize)
    .some((value) => identifiers.includes(value));
}
