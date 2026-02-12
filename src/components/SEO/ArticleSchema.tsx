import { Helmet } from 'react-helmet-async';

interface ArticleSchemaProps {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  slug: string;
  author?: string;
  category?: string;
  keywords?: string[];
  articleBody?: string;
}

export const ArticleSchema = ({
  title,
  description,
  image,
  datePublished,
  dateModified,
  slug,
  author = 'لمسة بيوتي',
  category,
  keywords = [],
  articleBody,
}: ArticleSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `https://lamsetbeauty.com/blog/${slug}`,
    headline: title,
    description: description,
    image: image ? {
      '@type': 'ImageObject',
      url: image,
      width: 1200,
      height: 630,
      name: title,
    } : {
      '@type': 'ImageObject',
      url: 'https://lamsetbeauty.com/logo.png',
      width: 512,
      height: 512,
    },
    inLanguage: 'ar-SA',
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: author,
      url: 'https://lamsetbeauty.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lamsetbeauty.com/logo.png',
        width: 512,
        height: 512,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: author,
      logo: {
        '@type': 'ImageObject',
        url: 'https://lamsetbeauty.com/logo.png',
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://lamsetbeauty.com/blog/${slug}`,
    },
    ...(articleBody && { articleBody: articleBody }),
    ...(category && { articleSection: category }),
    ...(keywords && keywords.length > 0 && { keywords: keywords.join(', ') }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};
