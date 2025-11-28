import { Helmet } from 'react-helmet-async';

interface Product {
  id: string;
  name_ar: string;
  slug?: string | null;
  price: number;
  image_url?: string | null;
  category?: string;
  is_active?: boolean;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

interface ItemListSchemaProps {
  products: Product[];
  listName?: string;
  category?: string;
}

export const ItemListSchema = ({
  products,
  listName = 'منتجات لمسة بيوتي',
  category,
}: ItemListSchemaProps) => {
  const baseUrl = 'https://sevengreenstore.com';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: category ? `${category} - ${listName}` : listName,
    description: category 
      ? `تسوق أفضل منتجات ${category} من لمسة بيوتي`
      : 'تسوق منتجات العناية الفاخرة من لمسة بيوتي - شحن مجاني في السعودية',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        '@id': `${baseUrl}/product/${product.slug || product.id}`,
        name: product.name_ar,
        url: `${baseUrl}/product/${product.slug || product.id}`,
        image: product.image_url || `${baseUrl}/placeholder.svg`,
        offers: {
          '@type': 'Offer',
          price: product.price.toString(),
          priceCurrency: 'SAR',
          availability: product.is_active 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          url: `${baseUrl}/product/${product.slug || product.id}`,
        },
        ...(category && { category }),
        // إضافة التقييمات للمنتجات في نتائج البحث
        ...(product.aggregateRating && product.aggregateRating.reviewCount > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(product.aggregateRating.ratingValue).toFixed(1),
            reviewCount: product.aggregateRating.reviewCount.toString(),
            bestRating: '5',
            worstRating: '1',
          },
        }),
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};