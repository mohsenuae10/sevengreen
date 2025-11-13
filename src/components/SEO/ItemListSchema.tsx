import { Helmet } from 'react-helmet-async';

interface Product {
  id: string;
  name_ar: string;
  slug?: string | null;
  price: number;
  image_url?: string | null;
  category?: string;
  is_active?: boolean;
}

interface ItemListSchemaProps {
  products: Product[];
  listName?: string;
  category?: string;
}

export const ItemListSchema = ({
  products,
  listName = 'منتجات سفن جرين',
  category,
}: ItemListSchemaProps) => {
  const baseUrl = 'https://sevengreenstore.com';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: category ? `${category} - ${listName}` : listName,
    description: category 
      ? `تسوق أفضل منتجات ${category} الطبيعية من سفن جرين`
      : 'تسوق منتجات العناية الطبيعية من سفن جرين - شحن مجاني في السعودية',
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