import { Helmet } from 'react-helmet-async';

interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  images?: string[];
  price: number;
  currency?: string;
  sku: string;
  availability: 'InStock' | 'OutOfStock';
  category?: string;
  brand?: string;
  gtin?: string;
  mpn?: string;
  slug?: string | null;
  weight?: string;
  dimensions?: string;
  color?: string;
  material?: string;
  warranty?: string;
  shippingDays?: number;
  returnDays?: number;
  madeIn?: string;
}

export const ProductSchema = ({
  name,
  description,
  image,
  images,
  price,
  currency = 'SAR',
  sku,
  availability,
  category,
  brand = 'متجر سفن جرين',
  gtin,
  mpn,
  slug,
  weight,
  dimensions,
  color,
  material,
  warranty,
  shippingDays = 3,
  returnDays = 14,
  madeIn,
}: ProductSchemaProps) => {
  const productUrl = `https://sevengreenstore.com/product/${slug || sku}`;
  
  // Generate dynamic priceValidUntil date (1 year from now)
  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);
  const priceValidUntilString = priceValidUntil.toISOString().split('T')[0];
  
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name,
    description,
    image: images && images.length > 0 ? images : [image],
    sku,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: currency,
      price: price.toString(),
      priceValidUntil: priceValidUntilString,
      availability: `https://schema.org/${availability}`,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'متجر سفن جرين',
        url: 'https://sevengreenstore.com',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: currency,
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'SA',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: shippingDays,
            maxValue: shippingDays + 2,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'SA',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: returnDays,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    ...(category && { category }),
    ...(gtin && { gtin }),
    ...(mpn && { mpn }),
    ...(weight && { weight: { '@type': 'QuantitativeValue', value: weight } }),
    ...(dimensions && { depth: dimensions, width: dimensions, height: dimensions }),
    ...(color && { color }),
    ...(material && { material }),
    ...(madeIn && { countryOfOrigin: madeIn }),
    ...(warranty && { 
      warranty: {
        '@type': 'WarrantyPromise',
        durationOfWarranty: {
          '@type': 'QuantitativeValue',
          value: warranty,
        },
      },
    }),
    // Note: aggregateRating removed - only add when you have real reviews
    audience: {
      '@type': 'PeopleAudience',
      geographicArea: {
        '@type': 'AdministrativeArea',
        name: 'المملكة العربية السعودية',
      },
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
