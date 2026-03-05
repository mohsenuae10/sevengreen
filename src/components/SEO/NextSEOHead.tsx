/**
 * Next.js SEO Head component — replaces react-helmet-async.
 * Renders meta tags inside next/head so they appear in server-rendered HTML.
 */
import Head from 'next/head';
import { DOMAIN, getAlternateUrl } from '@/i18n';

interface NextSEOHeadProps {
  title: string;
  description: string;
  lang?: 'ar' | 'en';
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  currency?: string;
  availability?: 'instock' | 'outofstock';
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: Record<string, any>;
  imageAlt?: string;
  author?: string;
  category?: string;
  noindex?: boolean;
}

export const NextSEOHead = ({
  title,
  description,
  lang = 'ar',
  keywords,
  image = 'https://lamsetbeauty.com/og-image.jpg',
  url,
  type = 'website',
  price,
  currency = 'SAR',
  availability,
  publishedTime,
  modifiedTime,
  structuredData,
  imageAlt,
  author,
  category,
  noindex = false,
}: NextSEOHeadProps) => {
  const seoAuthor = author || (lang === 'ar' ? 'لمسة بيوتي' : 'Lamset Beauty');

  // Title optimization (max 60 chars)
  const optimizedTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  const fullTitle =
    title.includes('لمسة بيوتي') || title.includes('Lamset Beauty')
      ? optimizedTitle
      : lang === 'ar'
        ? `${optimizedTitle} | لمسة بيوتي`
        : `${optimizedTitle} | Lamset Beauty`;

  // Description (max 160 chars)
  const optimizedDescription =
    description.length > 160 ? description.substring(0, 157) + '...' : description;

  const currentUrl = url
    ? url.startsWith('/') ? `${DOMAIN}${url}` : url
    : `${DOMAIN}/${lang}`;

  const arUrl = getAlternateUrl(url || `/${lang}`, 'ar');
  const enUrl = getAlternateUrl(url || `/${lang}`, 'en');

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={optimizedDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={seoAuthor} />
      <meta name="publisher" content={seoAuthor} />
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}
      />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta httpEquiv="content-language" content={lang === 'ar' ? 'ar-SA' : 'en-US'} />
      {category && <meta name="article:section" content={category} />}

      {/* Canonical & hreflang */}
      <link rel="canonical" href={currentUrl} />
      <link rel="alternate" hrefLang="ar" href={arUrl} />
      <link rel="alternate" hrefLang="ar-SA" href={arUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="en-US" href={enUrl} />
      <link rel="alternate" hrefLang="x-default" href={arUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={optimizedDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={imageAlt || title} />
      <meta property="og:site_name" content={lang === 'ar' ? 'لمسة بيوتي' : 'Lamset Beauty'} />
      <meta property="og:locale" content={lang === 'ar' ? 'ar_SA' : 'en_US'} />
      {lang === 'ar' && <meta property="og:locale:alternate" content="en_US" />}
      {lang === 'en' && <meta property="og:locale:alternate" content="ar_SA" />}

      {/* Article */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Product */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
          {availability && <meta property="product:availability" content={availability} />}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={optimizedDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt || title} />
      <meta name="twitter:domain" content="lamsetbeauty.com" />

      {/* JSON-LD */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
};

export default NextSEOHead;
