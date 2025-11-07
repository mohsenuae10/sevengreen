import { Helmet } from 'react-helmet-async';

interface LocalBusinessSchemaProps {
  name?: string;
  description?: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  priceRange?: string;
  openingHours?: string[];
}

export const LocalBusinessSchema = ({
  name = 'متجر سفن جرين',
  description = 'متجر سفن جرين - أفضل منتجات العناية الطبيعية للشعر والبشرة في السعودية. بار شامبو طبيعي، سيروم فيتامين سي، منتجات طبيعية 100% مع توصيل سريع لجميع مناطق المملكة.',
  telephone,
  email,
  address = {
    addressCountry: 'SA',
    addressLocality: 'Saudi Arabia',
  },
  priceRange = '$$',
  openingHours = ['Mo-Su 00:00-23:59'],
}: LocalBusinessSchemaProps = {}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://sevengreenstore.com/#localbusiness',
    name,
    alternateName: 'Seven Green Store',
    description,
    url: 'https://sevengreenstore.com',
    logo: 'https://storage.googleapis.com/gpt-engineer-file-uploads/FTkS9Pg7ErS94PYn0Zsid605WOf2/uploads/1760543849788-IMG_1206.jpeg',
    image: 'https://storage.googleapis.com/gpt-engineer-file-uploads/FTkS9Pg7ErS94PYn0Zsid605WOf2/social-images/social-1760543856406-d145a275-c3fb-4f7c-b8e7-6a240c841ffc.jpeg',
    priceRange,
    ...(telephone && { telephone }),
    ...(email && { email }),
    address: {
      '@type': 'PostalAddress',
      ...address,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '24.774265',
      longitude: '46.738586',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Saudi Arabia',
    },
    currenciesAccepted: 'SAR',
    paymentAccepted: 'Credit Card, Apple Pay, Visa, Mastercard, Google Pay',
    openingHoursSpecification: openingHours.map((hours) => {
      const [days, time] = hours.split(' ');
      const [opens, closes] = time.split('-');
      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: days
          .split('-')
          .map((day) => {
            const dayMap: Record<string, string> = {
              Mo: 'Monday',
              Tu: 'Tuesday',
              We: 'Wednesday',
              Th: 'Thursday',
              Fr: 'Friday',
              Sa: 'Saturday',
              Su: 'Sunday',
            };
            return dayMap[day];
          })
          .filter(Boolean),
        opens,
        closes,
      };
    }),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://sevengreenstore.com/products?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};
