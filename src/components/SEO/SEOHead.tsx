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
}: SEOHeadProps) => {
  // Optimize title (max 45 chars for better SEO)
  const optimizedTitle = title.length > 45 ? title.substring(0, 42) + '...' : title;
  // Add site name only if not already included
  const fullTitle = title.includes('لمسة بيوتي') 
    ? optimizedTitle 
    : `${optimizedTitle} | لمسة`;
  
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
      <meta name="application-name" content="لمسة بيوتي" />
      <meta name="author" content="لمسة بيوتي" />
      <meta name="publisher" content="لمسة بيوتي" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta httpEquiv="content-language" content="ar-SA" />
      <meta name="language" content="Arabic" />
      
      {/* Canonical & Alternate Languages */}
      <link rel="canonical" href={currentUrl} />
      <link rel="alternate" hrefLang="ar" href={currentUrl} />
      <link rel="alternate" hrefLang="ar-SA" href={currentUrl} />
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
      <meta property="og:site_name" content="لمسة بيوتي" />
      <meta property="og:locale" content="ar_SA" />

      {/* Article-specific Open Graph tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          <meta property="article:author" content="لمسة بيوتي" />
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
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:domain" content="lamsetbeauty.com" />
      <meta name="twitter:site" content="@lamsetbeauty" />
      <meta name="twitter:creator" content="@lamsetbeauty" />
    </Helmet>
  );
};
