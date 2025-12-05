import { Helmet } from 'react-helmet-async';

interface ArticleSchemaProps {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  slug: string;
}

export const ArticleSchema = ({
  title,
  description,
  image,
  datePublished,
  dateModified,
  slug,
}: ArticleSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: image ? {
      '@type': 'ImageObject',
      url: image,
      width: 1200,
      height: 630,
    } : {
      '@type': 'ImageObject',
      url: 'https://lamsetbeauty.com/logo.png',
      width: 512,
      height: 512,
    },
    inLanguage: 'ar',
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: 'لمسة بيوتي',
      url: 'https://lamsetbeauty.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'لمسة بيوتي',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lamsetbeauty.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://lamsetbeauty.com/blog/${slug}`,
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};
