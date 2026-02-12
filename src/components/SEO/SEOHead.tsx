import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
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
  language?: 'ar' | 'en';
  enUrl?: string;
}

export const SEOHead = ({
  title,
  description,
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
  author = 'لمسة بيوتي',
  category,
  language = 'ar',
  enUrl,
}: SEOHeadProps) => {
  // Optimize title (max 45 chars for better SEO)
  const optimizedTitle = title.length > 45 ? title.substring(0, 42) + '...' : title;
  // Add site name only if not already included
  const fullTitle = title.includes('لمسة بيوتي') || title.includes('Lamset Beauty')
    ? optimizedTitle 
    : language === 'ar' 
      ? `${optimizedTitle} | لمسة بيوتي`
      : `${optimizedTitle} | Lamset Beauty`;
  
  // Optimize description (max 160 chars)
  const optimizedDescription = description.length > 160 
    ? description.substring(0, 157) + '...'
    : description;
  
  // SEO: Use provided URL or construct from window location (decode Arabic URLs properly)
  const decodedPath = decodeURIComponent(window.location.pathname);
  // Ensure URL is always absolute
  let currentUrl = url || `https://lamsetbeauty.com${decodedPath}`;
  // If url prop is relative, make it absolute
  if (url && url.startsWith('/')) {
    currentUrl = `https://lamsetbeauty.com${url}`;
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={optimizedDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="application-name" content={language === 'ar' ? 'لمسة بيوتي' : 'Lamset Beauty'} />
      <meta name="author" content={author} />
      <meta name="publisher" content={author} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta httpEquiv="content-language" content={language === 'ar' ? 'ar-SA' : 'en-US'} />
      <meta name="language" content={language === 'ar' ? 'Arabic' : 'English'} />
      {category && <meta name="article:section" content={category} />}
      
      {/* Canonical & Alternate Languages */}
      <link rel="canonical" href={currentUrl} />
      <link rel="alternate" hrefLang="ar" href={currentUrl} />
      <link rel="alternate" hrefLang="ar-SA" href={currentUrl} />
      {enUrl && <link rel="alternate" hrefLang="en" href={enUrl} />}
      {enUrl && <link rel="alternate" hrefLang="en-US" href={enUrl} />}
      <link rel="alternate" hrefLang="x-default" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={optimizedDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content={language === 'ar' ? 'لمسة بيوتي' : 'Lamset Beauty'} />
      <meta property="og:locale" content={language === 'ar' ? 'ar_SA' : 'en_US'} />
      {language === 'ar' && <meta property="og:locale:alternate" content="en_US" />}
      {language === 'en' && <meta property="og:locale:alternate" content="ar_SA" />}

      {/* Article-specific Open Graph tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          <meta property="article:author" content={author} />
          {category && <meta property="article:section" content={category} />}
        </>
      )}

      {/* Product-specific Open Graph tags */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
          {availability && (
            <meta property="product:availability" content={availability} />
          )}
          {modifiedTime && <meta property="og:updated_time" content={modifiedTime} />}
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
      <meta name="twitter:site" content="@lamsetbeauty" />
      <meta name="twitter:creator" content="@lamsetbeauty" />

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Additional SEO Meta Tags */}
      <meta name="revisit-after" content="7 days" />
      <meta name="expires" content="604800" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/favicon.png" />
    </Helmet>
  );
};
