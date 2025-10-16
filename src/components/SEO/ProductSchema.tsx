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
  brand = 'Seven Green',
  rating,
  reviewCount,
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
      availability: `https://schema.org/${availability}`,
      seller: {
        '@type': 'Organization',
        name: 'Seven Green',
      },
    },
    ...(category && { category }),
    ...(rating && reviewCount && {
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
