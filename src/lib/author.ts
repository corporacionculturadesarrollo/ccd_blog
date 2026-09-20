import type { CollectionEntry } from 'astro:content';

type Author = CollectionEntry<'autores'>;
type AuthorImageSource = {
  authorSlug?: string;
  author: string;
  authorImage?: string;
};

const normalize = (value: string | undefined) =>
  value?.trim().toLocaleLowerCase() || '';

const isDefaultInstitutionalImage = (value?: string) => {
  const normalized = value?.trim();
  return normalized === '/images/ccd-auth.svg' || normalized === '/images/author-default.svg';
};

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

export function resolveAuthorImage(
  authors: Author[],
  source: AuthorImageSource,
): string {
  const author = resolveAuthor(authors, source.authorSlug, source.author);

  if (author?.data.image) {
    return author.data.image;
  }

  const fallbackImage = source.authorImage?.trim();
  if (fallbackImage && !isDefaultInstitutionalImage(fallbackImage)) {
    return fallbackImage;
  }

  return '/images/author-default.svg';
}

export function postBelongsToAuthor(
  post: CollectionEntry<'blog'>,
  author: Author,
): boolean {
  const identifiers = [author.id, author.data.slug, author.data.name].map(normalize);
  return [post.data.authorSlug, post.data.author].map(normalize)
    .some((value) => identifiers.includes(value));
}
