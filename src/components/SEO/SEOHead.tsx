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
}

export const SEOHead = ({
  title,
  description,
  keywords,
  image = 'https://storage.googleapis.com/gpt-engineer-file-uploads/FTkS9Pg7ErS94PYn0Zsid605WOf2/social-images/social-1760543856406-d145a275-c3fb-4f7c-b8e7-6a240c841ffc.jpeg',
  url,
  type = 'website',
  price,
  currency = 'SAR',
  availability,
}: SEOHeadProps) => {
  const fullTitle = `${title} | متجر سفن جرين`;
  const currentUrl = url || (typeof window !== 'undefined' ? `https://sevengreenstore.com${window.location.pathname}` : 'https://sevengreenstore.com');
  
  // Map availability values for Open Graph
  const ogAvailabilityMap: Record<string, string> = {
    'instock': 'instock',
    'outofstock': 'oos',
    'preorder': 'preorder'
  };
  
  const ogAvailability = availability ? ogAvailabilityMap[availability] || availability : undefined;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="application-name" content="متجر سفن جرين" />
      <meta name="author" content="متجر سفن جرين" />
      <meta name="publisher" content="متجر سفن جرين" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta httpEquiv="content-language" content="ar-SA" />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="متجر سفن جرين" />
      <meta property="og:locale" content="ar_SA" />

      {/* Product-specific Open Graph tags */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
          {ogAvailability && (
            <meta property="product:availability" content={ogAvailability} />
          )}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:domain" content="sevengreenstore.com" />
    </Helmet>
  );
};
