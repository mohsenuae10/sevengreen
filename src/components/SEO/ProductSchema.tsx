import { Helmet } from 'react-helmet-async';

interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  sku: string;
  availability: 'InStock' | 'OutOfStock';
  category?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  gtin?: string;
  mpn?: string;
}

export const ProductSchema = ({
  name,
  description,
  image,
  price,
  currency = 'SAR',
  sku,
  availability,
  category,
  brand = 'متجر سفن جرين',
  rating,
  reviewCount,
  gtin,
  mpn,
}: ProductSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name,
    description,
    image,
    sku,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      url: `https://sevengreenstore.com${window.location.pathname}`,
      priceCurrency: currency,
      price: price.toString(),
      priceValidUntil: '2025-12-31',
      availability: `https://schema.org/${availability}`,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'متجر سفن جرين',
      },
    },
    ...(category && { category }),
    ...(gtin && { gtin }),
    ...(mpn && { mpn }),
    ...(rating && reviewCount && reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.toString(),
        reviewCount: reviewCount.toString(),
        bestRating: '5',
        worstRating: '1',
      },
    }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
