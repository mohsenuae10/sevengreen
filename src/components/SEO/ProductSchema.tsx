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
  createdAt?: string;
  updatedAt?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  originalPrice?: number;
  discountPercentage?: number;
  videoUrl?: string;
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
  brand = 'لمسة بيوتي',
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
  createdAt,
  updatedAt,
  aggregateRating,
  originalPrice,
  discountPercentage,
  videoUrl,
}: ProductSchemaProps) => {
  // Decode URL properly for Arabic slugs
  const productUrl = `https://lamsetbeauty.com/product/${slug ? decodeURIComponent(slug) : sku}`;
  
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
    // SEO: Add publish and modification dates for freshness signals
    ...(createdAt && { datePublished: createdAt }),
    ...(updatedAt && { dateModified: updatedAt }),
    offers: originalPrice && discountPercentage ? {
      '@type': 'AggregateOffer',
      url: productUrl,
      priceCurrency: currency,
      lowPrice: price.toString(),
      highPrice: originalPrice.toString(),
      offerCount: '1',
      availability: `https://schema.org/${availability}`,
      priceValidUntil: priceValidUntilString,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'لمسة بيوتي',
        url: 'https://lamsetbeauty.com',
      },
      offers: [{
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: currency,
        price: price.toString(),
        priceValidUntil: priceValidUntilString,
        availability: `https://schema.org/${availability}`,
        ...(createdAt && { availabilityStarts: createdAt }),
        itemCondition: 'https://schema.org/NewCondition',
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: price.toString(),
          priceCurrency: currency,
          valueAddedTaxIncluded: true,
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
      }],
    } : {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: currency,
      price: price.toString(),
      priceValidUntil: priceValidUntilString,
      availability: `https://schema.org/${availability}`,
      ...(createdAt && { availabilityStarts: createdAt }),
      itemCondition: 'https://schema.org/NewCondition',
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: price.toString(),
        priceCurrency: currency,
        valueAddedTaxIncluded: true,
      },
      seller: {
        '@type': 'Organization',
        name: 'لمسة بيوتي',
        url: 'https://lamsetbeauty.com',
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
    // SEO: Add aggregate rating with proper validation for rich snippets
    ...(aggregateRating?.ratingValue && aggregateRating?.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(aggregateRating.ratingValue).toFixed(1),
        reviewCount: aggregateRating.reviewCount.toString(),
        bestRating: '5',
        worstRating: '1',
      },
    }),
    ...(warranty && { 
      warranty: {
        '@type': 'WarrantyPromise',
        durationOfWarranty: {
          '@type': 'QuantitativeValue',
          value: warranty,
        },
      },
    }),
    // SEO: Add video if available for better rich results
    ...(videoUrl && {
      video: {
        '@type': 'VideoObject',
        name: `${name} - فيديو المنتج`,
        description: `شاهد ${name} بالتفصيل`,
        contentUrl: videoUrl,
        thumbnailUrl: image,
        uploadDate: createdAt || new Date().toISOString(),
      },
    }),
    audience: {
      '@type': 'PeopleAudience',
      geographicArea: {
        '@type': 'AdministrativeArea',
        name: 'المملكة العربية السعودية',
      },
    },
    // SEO: Add additional product properties for better indexing
    isRelatedTo: {
      '@type': 'Product',
      name: `منتجات ${category || 'العناية الطبيعية'}`,
      url: `https://lamsetbeauty.com/products${category ? `?category=${encodeURIComponent(category)}` : ''}`,
    },
    isSimilarTo: {
      '@type': 'Product',
      name: 'منتجات لمسة بيوتي الطبيعية',
      url: 'https://lamsetbeauty.com/products',
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
